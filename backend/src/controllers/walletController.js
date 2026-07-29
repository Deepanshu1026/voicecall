const crypto = require('crypto');
const Razorpay = require('razorpay');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');
const config = require('../config');

let razorpayInstance = null;
function getRazorpay() {
  if (!razorpayInstance) {
    const keyId = config.razorpay.keyId;
    const keySecret = config.razorpay.keySecret;
    if (!keyId || !keySecret) {
      console.error('[Razorpay] Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET environment variables');
      throw new AppError('Payment gateway is not configured on the server. Please contact support.', 503);
    }
    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpayInstance;
}

const getWallet = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('walletBalance username displayName email');
  if (!user) throw new AppError('User not found', 404);

  const transactions = await Transaction.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .limit(50);

  ApiResponse.success(res, {
    balance: user.walletBalance,
    user: {
      username: user.username,
      displayName: user.displayName,
      email: user.email,
    },
    transactions,
  }, 'Wallet retrieved');
});

const createOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new AppError('Valid positive amount is required', 400);
  }

  const user = await User.findById(req.userId).select('email displayName');
  if (!user) throw new AppError('User not found', 404);

  const receipt = (`wlt_${req.userId.toString().slice(-8)}_${Date.now()}`).slice(0, 40);
  console.log('[Razorpay] Creating order. Receipt:', receipt, 'Length:', receipt.length);

  const options = {
    amount: Math.round(amount * 100), // Razorpay expects amount in paise
    currency: 'INR',
    receipt,
    notes: {
      userId: String(req.userId),
      email: user.email,
      description: 'Wallet recharge',
    },
  };

  const order = await getRazorpay().orders.create(options);

  ApiResponse.success(res, {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: config.razorpay.keyId,
  }, 'Order created');
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError('Payment details are required', 400);
  }

  const keySecret = config.razorpay.keySecret;
  if (!keySecret) {
    console.error('[Razorpay] Missing RAZORPAY_KEY_SECRET environment variable');
    throw new AppError('Payment gateway is not configured on the server. Please contact support.', 503);
  }
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    throw new AppError('Invalid payment signature', 400);
  }

  const creditAmount = amount && typeof amount === 'number' && amount > 0 ? amount : 0;
  if (creditAmount <= 0) {
    throw new AppError('Invalid amount', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $inc: { walletBalance: creditAmount } },
    { new: true }
  );
  if (!user) throw new AppError('User not found', 404);

  const transaction = await Transaction.create({
    user: req.userId,
    amount: creditAmount,
    type: 'credit',
    description: 'Wallet recharge via Razorpay',
    status: 'completed',
    metadata: {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    },
  });

  if (req.io) {
    req.io.to(`user:${req.userId}`).emit('wallet:updated', { balance: user.walletBalance });
  }

  ApiResponse.success(res, {
    balance: user.walletBalance,
    transaction,
  }, 'Payment verified and wallet credited');
});

// Legacy direct add-money (kept for admin/internal use if needed)
const addMoney = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new AppError('Valid positive amount is required', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $inc: { walletBalance: amount } },
    { new: true }
  );
  if (!user) throw new AppError('User not found', 404);

  const transaction = await Transaction.create({
    user: req.userId,
    amount,
    type: 'credit',
    description: 'Wallet recharge',
    status: 'completed',
  });

  if (req.io) {
    req.io.to(`user:${req.userId}`).emit('wallet:updated', { balance: user.walletBalance });
  }

  ApiResponse.success(res, {
    balance: user.walletBalance,
    transaction,
  }, 'Money added to wallet');
});

const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const transactions = await Transaction.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Transaction.countDocuments({ user: req.userId });

  ApiResponse.paginated(res, transactions, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
  });
});

module.exports = {
  getWallet,
  createOrder,
  verifyPayment,
  addMoney,
  getTransactions,
};
