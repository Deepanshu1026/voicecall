const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
}, { strict: false, collection: 'banners' });

module.exports = mongoose.model('Banner', bannerSchema);
