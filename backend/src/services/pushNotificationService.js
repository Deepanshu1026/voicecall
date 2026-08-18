const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const fs = require('fs');
const config = require('../config');
const FcmToken = require('../models/FcmToken');

let app = null;
let messaging = null;
let initialized = false;
let initError = null;

function init() {
  if (initialized) return messaging;

  try {
    let credential;
    const serviceAccountPath = config.fcm?.serviceAccountPath;
    const serviceAccountJson = config.fcm?.serviceAccountJson;

    if (serviceAccountJson) {
      const parsed = JSON.parse(serviceAccountJson);
      credential = cert(parsed);
    } else if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      const parsed = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      credential = cert(parsed);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      const parsed = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
      credential = cert(parsed);
    } else {
      throw new Error('Firebase service account credentials not configured');
    }

    app = initializeApp({ credential });
    messaging = getMessaging(app);
    initialized = true;
    return messaging;
  } catch (err) {
    initError = err.message;
    initialized = false;
    return null;
  }
}

function buildMessage({ title, body, data = {}, imageUrl }) {
  const message = {
    notification: {
      title,
      body,
    },
    data,
  };
  if (imageUrl) {
    message.notification.imageUrl = imageUrl;
  }
  return message;
}

async function sendToToken({ token, title, body, data = {}, imageUrl }) {
  const fcm = init();
  if (!fcm) {
    return { success: false, error: initError || 'FCM not initialized' };
  }

  const message = buildMessage({ title, body, data, imageUrl });
  message.token = token;

  try {
    const response = await fcm.send(message);
    return { success: true, messageId: response };
  } catch (err) {
    if (isInvalidTokenError(err)) {
      await FcmToken.deleteOne({ token });
    }
    return { success: false, error: err.message || 'FCM send failed' };
  }
}

async function sendMulticast({ tokens, title, body, data = {}, imageUrl }) {
  const fcm = init();
  if (!fcm) {
    return { success: false, error: initError || 'FCM not initialized' };
  }

  const message = buildMessage({ title, body, data, imageUrl });
  message.tokens = tokens;

  try {
    const response = await fcm.sendEachForMulticast(message);
    const tokenIds = [];
    const tokensToDelete = [];

    response.responses.forEach((r, idx) => {
      if (!r.success && isInvalidTokenError(r.error)) {
        tokensToDelete.push(tokens[idx]);
      }
    });

    if (tokensToDelete.length > 0) {
      await FcmToken.deleteMany({ token: { $in: tokensToDelete } });
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokensRemoved: tokensToDelete.length,
      responses: response.responses?.map((r) => (r.success ? { success: true, messageId: r.messageId } : { success: false, error: r.error?.message })),
    };
  } catch (err) {
    return { success: false, error: err.message || 'FCM multicast failed' };
  }
}

async function sendBroadcast({ title, body, data = {}, imageUrl, batchSize = 500 }) {
  const fcm = init();
  if (!fcm) {
    return { success: false, error: initError || 'FCM not initialized' };
  }

  const tokens = await FcmToken.find().select('token').lean();
  if (tokens.length === 0) {
    return { success: false, error: 'No FCM tokens found' };
  }

  const tokenList = tokens.map((t) => t.token);
  const invalidTokenIds = [];
  let totalSuccess = 0;
  let totalFailure = 0;

  for (let i = 0; i < tokenList.length; i += batchSize) {
    const batch = tokenList.slice(i, i + batchSize);
    const message = buildMessage({ title, body, data, imageUrl });
    message.tokens = batch;

    try {
      const response = await fcm.sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;

      response.responses.forEach((r, idx) => {
        if (!r.success && isInvalidTokenError(r.error)) {
          invalidTokenIds.push(tokens[i + idx]._id);
        }
      });
    } catch (err) {
      totalFailure += batch.length;
    }
  }

  if (invalidTokenIds.length > 0) {
    await FcmToken.deleteMany({ _id: { $in: invalidTokenIds } });
  }

  return {
    success: true,
    successCount: totalSuccess,
    failureCount: totalFailure,
    totalTokens: tokenList.length,
    invalidTokensRemoved: invalidTokenIds.length,
  };
}

function isInvalidTokenError(error) {
  if (!error) return false;
  const code = error.code || error.message || '';
  const invalidCodes = [
    'messaging/invalid-registration-token',
    'messaging/registration-token-not-registered',
    'NotRegistered',
    'InvalidRegistration',
  ];
  return invalidCodes.some((c) => code.toLowerCase().includes(c.toLowerCase()));
}

function isConfigured() {
  return !!init();
}

function getInitError() {
  return initError;
}

module.exports = {
  sendToToken,
  sendMulticast,
  sendBroadcast,
  isConfigured,
  getInitError,
};
