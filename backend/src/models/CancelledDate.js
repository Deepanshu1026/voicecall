const mongoose = require('mongoose');

const cancelledDateSchema = new mongoose.Schema({
  // YYYY-MM-DD. Dates on which the Premium (Chairman) meeting cannot be booked.
  meetingDate: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CancelledDate', cancelledDateSchema);
