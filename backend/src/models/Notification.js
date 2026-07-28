const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  mediaPath: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
