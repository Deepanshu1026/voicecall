const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  key: { type: String, default: '' },
  name: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ApiKey', apiKeySchema);
