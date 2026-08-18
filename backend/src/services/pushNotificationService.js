const path = require('path');
const fs = require('fs');
const config = require('../config');

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

async function sendToToken({ token, title, body, data = {}, imageUrl }) {
  const fcm = init();
  if (!fcm) {
    return { success: false, error: initError || 'FCM not initialized' };
  }

  const message = {
    token,
    notification: {
      title,
      body,
    },
    data,
  };
  if (imageUrl) {
    message.notification.imageUrl = imageUrl;
  }

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

  const message = {
    tokens,
    notification: {
      title,
      body,
    },
    data,
  };
  if (imageUrl) {
    message.notification.imageUrl = imageUrl;
  }

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

function isConfigured() {
  return !!init();
}

function getInitError() {
  return initError;
}

module.exports = {
  sendToToken,
  sendMulticast,
  isConfigured,
  getInitError,
};
