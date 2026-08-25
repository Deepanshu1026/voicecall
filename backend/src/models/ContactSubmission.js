const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  page: { type: String, default: 'home' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

contactSubmissionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ContactSubmission', contactSubmissionSchema);
