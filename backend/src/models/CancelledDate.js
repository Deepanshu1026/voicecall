const mongoose = require('mongoose');

const cancelledDateSchema = new mongoose.Schema({
  meetingDate: { type: String, required: true },
});

module.exports = mongoose.model('CancelledDate', cancelledDateSchema);
