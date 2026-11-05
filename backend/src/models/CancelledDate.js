const mongoose = require('mongoose');

// A blocked date. `plans` lists the meeting types that cannot be booked on that
// date: any of 'basic' | 'advance' | 'premium', or 'all' for every type.
const cancelledDateSchema = new mongoose.Schema({
  meetingDate: { type: String, required: true, unique: true, index: true },
  plans: { type: [String], default: ['all'] },
  createdAt: { type: Date, default: Date.now },
});

// True when `plans` blocks the given meeting type.
cancelledDateSchema.statics.blocksPlan = (plans, plan) => {
  const list = Array.isArray(plans) && plans.length ? plans : ['all'];
  return list.includes('all') || list.includes(String(plan || '').toLowerCase());
};

module.exports = mongoose.model('CancelledDate', cancelledDateSchema);
