const Setting = require('../models/Setting');
const ContactSettings = require('../models/ContactSettings');
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

const CONTACT_DEFAULTS = {
  email: 'Support@avisaexperts.com',
  phone: '+91 120-4502750',
  whatsapp: '+91 9711000022',
  emailResponseTime: 'Response within 2-4 hours',
  phoneHours: 'Mon-Sat, 11AM-6PM EST',
  whatsappHours: 'Mon-Sat, 11AM-6PM EST',
};

const getContactSettings = asyncHandler(async (req, res) => {
  const docs = await ContactSettings.find({}).lean();
  const settings = { ...CONTACT_DEFAULTS };
  for (const doc of docs) {
    settings[doc.key] = doc.value;
  }
  ApiResponse.success(res, { settings });
});

const updateContactSettings = asyncHandler(async (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    throw new AppError('Settings body is required', 400);
  }

  const allowedKeys = Object.keys(CONTACT_DEFAULTS);
  const invalidKeys = Object.keys(updates).filter((k) => !allowedKeys.includes(k));
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

  await ContactSettings.bulkWrite(bulkOps);

  const docs = await ContactSettings.find({ key: { $in: Object.keys(updates) } }).lean();
  const settings = { ...CONTACT_DEFAULTS };
  for (const doc of docs) {
    settings[doc.key] = doc.value;
  }

  ApiResponse.success(res, { settings }, 'Contact settings updated');
});

module.exports = { getSettings, updateSettings, getContactSettings, updateContactSettings };
