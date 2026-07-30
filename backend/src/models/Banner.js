const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  file_path: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Banner', bannerSchema);
