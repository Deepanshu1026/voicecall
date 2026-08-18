const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  username: { type: String },
  email: { type: String },
  mobile: { type: String },
  loginFrom: { type: String, enum: ['web', 'app'], default: 'web' },
  ip: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

loginHistorySchema.index({ createdAt: -1 });
loginHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
