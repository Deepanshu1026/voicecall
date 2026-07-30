const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_name: { type: String, default: 'Anonymous' },
  visa_type: { type: String, default: 'Visa' },
  rating: { type: Number, default: 5.0 },
  story: { type: String, default: '' },
  user_image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Review', reviewSchema);
