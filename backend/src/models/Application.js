const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Original MySQL id, kept for reference during migration
  sqlId: { type: Number, index: true },
  // Maps to Employee.sqlId / calling_team.id
  agentId: { type: Number, required: true, index: true },
  clientName: { type: String, required: true },
  contactNumber: { type: String },
  // Stored as a parsed object; the old MySQL table stored it as JSON text
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'follow_up'],
    default: 'pending',
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: false });

module.exports = mongoose.model('Application', applicationSchema);
