const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
}, { strict: false, collection: 'reviews' });

module.exports = mongoose.model('Review', reviewSchema);
