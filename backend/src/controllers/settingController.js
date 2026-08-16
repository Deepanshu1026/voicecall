const Setting = require('../models/Setting');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');
const { invalidateChatSettingsCache } = require('../services/settingService');

const ALLOWED_KEYS = ['unlimitedFreeChat', 'freeChatDurationSeconds', 'chatPaymentAmount'];

const getSettings = asyncHandler(async (req, res) => {
  const keys = req.query.keys ? req.query.keys.split(',') : ALLOWED_KEYS;
  const docs = await Setting.find({ key: { $in: keys } }).lean();
  const settings = {};
  for (const doc of docs) {
    settings[doc.key] = doc.value;
  }
  ApiResponse.success(res, { settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    throw new AppError('Settings body is required', 400);
  }

  const invalidKeys = Object.keys(updates).filter((k) => !ALLOWED_KEYS.includes(k));
  if (invalidKeys.length > 0) {
    throw new AppError(`Invalid settings keys: ${invalidKeys.join(', ')}`, 400);
  }

  const bulkOps = Object.entries(updates).map(([key, value]) => ({
    updateOne: {
      filter: { key },
      update: { $set: { key, value } },
      upsert: true,
    },
  }));

  await Setting.bulkWrite(bulkOps);
  invalidateChatSettingsCache();

  const docs = await Setting.find({ key: { $in: Object.keys(updates) } }).lean();
  const settings = {};
  for (const doc of docs) {
    settings[doc.key] = doc.value;
  }

  ApiResponse.success(res, { settings }, 'Settings updated');
});

module.exports = { getSettings, updateSettings };
