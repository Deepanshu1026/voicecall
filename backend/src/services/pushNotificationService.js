const path = require('path');
const fs = require('fs');
const config = require('../config');
const FcmToken = require('../models/FcmToken');

let messaging = null;
let initialized = false;
let initError = null;

function init() {
  if (initialized) return messaging;

  try {
    const admin = require('firebase-admin');

    let credential;
    const serviceAccountPath = config.fcm?.serviceAccountPath;
    const serviceAccountJson = config.fcm?.serviceAccountJson;

    if (serviceAccountJson) {
      const parsed = JSON.parse(serviceAccountJson);
      credential = admin.credential.cert(parsed);
    } else if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
      const parsed = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      credential = admin.credential.cert(parsed);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      const parsed = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
      credential = admin.credential.cert(parsed);
    } else {
      throw new Error('Firebase service account credentials not configured');
    }

    admin.initializeApp({
      credential,
    });
    messaging = admin.messaging();
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
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
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
  return (
    code.includes('messaging/invalid-registration-token') ||
    code.includes('messaging/registration-token-not-registered') ||
    code.includes('invalid-registration-token') ||
    code.includes('not-registered')
  );
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
