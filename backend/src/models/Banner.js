const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    imageUrl: { type: String, required: true },
    altText: { type: String, default: 'Special offer' },
    link: { type: String, default: '' },
  },
  { timestamps: true, collection: 'banners' }
);

bannerSchema.statics.getSingleton = async function () {
  let banner = await this.findOne();
  if (!banner) {
    banner = await this.create({
      enabled: true,
      imageUrl: 'https://lh3.googleusercontent.com/d/11BM8gGhbKw7lVR61hnk6wd2CJ8mx9f9a',
      altText: 'Special offer',
      link: '',
    });
  }
  return banner;
};

module.exports = mongoose.model('Banner', bannerSchema);
