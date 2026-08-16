const Setting = require('../models/Setting');
const config = require('../config');

const DEFAULTS = {
  unlimitedFreeChat: false,
  freeChatDurationSeconds: config.freeChatDurationSeconds || 600,
  chatPaymentAmount: config.chatPaymentAmount || 100,
};

let cache = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5000; // refresh every 5 seconds to keep it dynamic but avoid hammering DB

const getChatSettings = async () => {
  const now = Date.now();
  if (cache && cacheExpiry > now) return cache;

  try {
    const keys = ['unlimitedFreeChat', 'freeChatDurationSeconds', 'chatPaymentAmount'];
    const docs = await Setting.find({ key: { $in: keys } }).lean();
    const fromDb = {};
    for (const doc of docs) {
      fromDb[doc.key] = doc.value;
    }

    cache = {
      unlimitedFreeChat: fromDb.unlimitedFreeChat ?? DEFAULTS.unlimitedFreeChat,
      freeChatDurationSeconds: parseInt(fromDb.freeChatDurationSeconds ?? DEFAULTS.freeChatDurationSeconds, 10) || DEFAULTS.freeChatDurationSeconds,
      chatPaymentAmount: parseInt(fromDb.chatPaymentAmount ?? DEFAULTS.chatPaymentAmount, 10) || DEFAULTS.chatPaymentAmount,
    };
  } catch (err) {
    console.error('Error loading chat settings from DB:', err);
    cache = { ...DEFAULTS };
  }

  cacheExpiry = now + CACHE_TTL_MS;
  return cache;
};

const invalidateChatSettingsCache = () => {
  cache = null;
  cacheExpiry = 0;
};

module.exports = { getChatSettings, invalidateChatSettingsCache };
