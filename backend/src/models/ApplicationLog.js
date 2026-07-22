const mongoose = require('mongoose');

const applicationLogSchema = new mongoose.Schema({
  // Original MySQL id, kept for reference during migration
  sqlId: { type: Number, index: true },
  // Original MySQL application_id
  applicationId: { type: Number, required: true, index: true },
  // Maps to Employee.sqlId / calling_team.id
  userId: { type: Number, required: true },
  actionType: { type: String, required: true, index: true },
  // Stored as a parsed object; the old MySQL table stored it as JSON text
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: false });

module.exports = mongoose.model('ApplicationLog', applicationLogSchema);
