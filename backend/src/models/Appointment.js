const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  sqlUserId: { type: Number, default: null },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  contact: { type: String, default: '' },
  address: { type: String, default: '' },
  query: { type: String, default: '' },
  mode: { type: String, default: 'online' },
  date: { type: String, default: '' },
  selectedPlan: { type: String, default: 'basic' },
  timeSlot: { type: String, default: '' },
  submissionTime: { type: Date, default: Date.now },
  meetingConfirm: { type: String, default: 'pending' },
  screenshot: { type: String, default: '' },
  referenceId: { type: String, default: '' },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  datetime: { type: String, default: '' },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
