const mongoose = require('mongoose');

const meetingSettingsSchema = new mongoose.Schema({
  advancePrice: { type: Number, default: 1180 },
  premiumPrice: { type: Number, default: 1770 },
  basicPrice: { type: Number, default: 0 },
  onlineMeetingsEnabled: { type: Boolean, default: true },
  offlineMeetingsEnabled: { type: Boolean, default: true },
}, { timestamps: true });

meetingSettingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('MeetingSettings', meetingSettingsSchema);
