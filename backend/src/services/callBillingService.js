const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Call = require('../models/Call');
const { getAccountById, getAccountDocumentById } = require('../utils/account');

const DEFAULT_RATE_PER_MINUTE = 100000;
const BILLING_INTERVAL_MS = 60 * 1000; // 1 minute
const LOW_BALANCE_GRACE_MS = 5 * 1000; // 5 seconds warning before auto-end

const activeBillings = new Map(); // callId -> { timer, callId, roomId, callerId, ratePerMinute, lastBilledAt }

const getEffectiveRate = (receiver, callRate) => {
  if (typeof callRate === 'number' && callRate > 0) return callRate;
  if (receiver && typeof receiver.callRate === 'number' && receiver.callRate > 0) {
    return receiver.callRate;
  }
  return DEFAULT_RATE_PER_MINUTE;
};

const hasSufficientBalance = async (callerId, amount) => {
  const caller = await getAccountById(callerId, 'walletBalance');
  return caller && caller.walletBalance >= amount;
};

const createDebitTransaction = async (callerId, amount, callId, description) => {
  await Transaction.create({
    user: callerId,
    amount,
    type: 'debit',
    description,
    status: 'completed',
    call: callId,
    metadata: { call: callId.toString() },
  });
};

const startBilling = async (callId, roomId, io, onEndCall) => {
  const callIdStr = callId.toString();
  if (activeBillings.has(callIdStr)) return;

  const call = await Call.findById(callId);
  if (!call || !call.startedAt) return;

  const [callerResult, receiver] = await Promise.all([
    getAccountDocumentById(call.caller, 'walletBalance username displayName avatar'),
    getAccountById(call.receiver, 'callRate username displayName avatar'),
  ]);
  if (!callerResult || !receiver) return;

  const caller = callerResult.account;
  const ratePerMinute = getEffectiveRate(receiver, call.ratePerMinute);
  if (ratePerMinute <= 0) return; // Free call

  const callerId = caller._id.toString();

  // Snapshot the rate on the call record if it wasn't already set
  if (!call.ratePerMinute) {
    call.ratePerMinute = ratePerMinute;
  }
  call.billingStartedAt = new Date(call.billingStartedAt || call.startedAt);
  call.lastBilledAt = new Date(call.lastBilledAt || call.startedAt);
  await call.save();

  const billing = {
    timer: null,
    callId,
    roomId,
    callerId,
    ratePerMinute,
    lastBilledAt: call.lastBilledAt,
    isStopping: false,
    io,
  };

  billing.timer = setInterval(async () => {
    try {
      const currentCall = await Call.findById(callId);
      if (!currentCall || currentCall.status !== 'ongoing') {
        await stopBilling(callId);
        if (onEndCall) onEndCall();
        return;
      }

      const callerResult = await getAccountDocumentById(callerId, 'walletBalance');
      if (!callerResult) {
        await stopBilling(callId);
        if (onEndCall) onEndCall();
        return;
      }
      const caller = callerResult.account;

      if (caller.walletBalance < ratePerMinute) {
        if (billing.isStopping) return;
        billing.isStopping = true;
        io.to(roomId).emit('call:low-balance', {
          callId: callIdStr,
          message: 'Insufficient balance. The call will end shortly.',
          amountCharged: currentCall.amountCharged || 0,
        });
        setTimeout(async () => {
          await stopBilling(callId);
          if (onEndCall) onEndCall();
        }, LOW_BALANCE_GRACE_MS);
        return;
      }

      // Deduct one minute charge
      caller.walletBalance -= ratePerMinute;
      await caller.save();
      await createDebitTransaction(
        callerId,
        ratePerMinute,
        callId,
        `Call charge (${ratePerMinute}/min)`
      );

      currentCall.amountCharged = (currentCall.amountCharged || 0) + ratePerMinute;
      currentCall.lastBilledAt = new Date();
      await currentCall.save();

      billing.lastBilledAt = currentCall.lastBilledAt;
      io.to(roomId).emit('call:charged', {
        callId: callIdStr,
        amountCharged: currentCall.amountCharged,
        ratePerMinute,
      });

      // Notify the caller's wallet in real-time
      io.to(`user:${callerId}`).emit('wallet:updated', {
        balance: caller.walletBalance,
        amountDebited: ratePerMinute,
        callId: callIdStr,
        reason: 'call-charge',
      });
    } catch (err) {
      console.error('[CallBilling] interval error:', err);
    }
  }, BILLING_INTERVAL_MS);

  activeBillings.set(callIdStr, billing);
};

const stopBilling = async (callId) => {
  const callIdStr = callId.toString();
  const billing = activeBillings.get(callIdStr);
  if (!billing) return 0;

  clearInterval(billing.timer);
  activeBillings.delete(callIdStr);

  const call = await Call.findById(callId);
  const io = billing.io;
  if (!call) return 0;

  let extraCharge = 0;
  if (billing.ratePerMinute > 0 && call.status === 'ongoing') {
    const now = new Date();
    const lastBilled = new Date(call.lastBilledAt || call.startedAt || now);
    const secondsSinceLastBill = Math.max(0, (now - lastBilled) / 1000);
    const prorated = Math.round((secondsSinceLastBill / 60) * billing.ratePerMinute);
    extraCharge = Math.max(0, prorated);

    if (extraCharge > 0) {
      const callerResult = await getAccountDocumentById(billing.callerId, 'walletBalance');
      if (callerResult && callerResult.account.walletBalance >= extraCharge) {
        const caller = callerResult.account;
        caller.walletBalance -= extraCharge;
        await caller.save();
        await createDebitTransaction(
          billing.callerId,
          extraCharge,
          callId,
          'Call charge (prorated)'
        );
      } else {
        // Caller doesn't have enough for the prorated remainder; charge whatever is left
        const remaining = callerResult ? callerResult.account.walletBalance : 0;
        if (remaining > 0) {
          const caller = callerResult.account;
          caller.walletBalance = 0;
          await caller.save();
          await createDebitTransaction(
            billing.callerId,
            remaining,
            callId,
            'Call charge (remaining balance)'
          );
          extraCharge = remaining;
        }
      }

      if (io) {
        io.to(`user:${billing.callerId}`).emit('wallet:updated', {
          balance: callerResult?.account?.walletBalance ?? 0,
          amountDebited: extraCharge,
          callId: callIdStr,
          reason: 'call-charge-prorated',
        });
      }
    }
  }

  call.amountCharged = (call.amountCharged || 0) + extraCharge;
  call.billingEndedAt = new Date();
  await call.save();

  return call.amountCharged;
};

const isBillingActive = (callId) => {
  return activeBillings.has(callId.toString());
};

module.exports = {
  startBilling,
  stopBilling,
  hasSufficientBalance,
  getEffectiveRate,
  isBillingActive,
};
