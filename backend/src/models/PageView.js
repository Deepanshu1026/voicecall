const mongoose = require('mongoose');

// One document per page path per day, so the admin can see which marketing
// pages are actually being visited. Mirrors the PostView model used for blogs.
const pageViewSchema = new mongoose.Schema(
  {
    path: { type: String, required: true }, // normalised, e.g. '/uk-visa'
    day: { type: String, required: true }, // YYYY-MM-DD (UTC)
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

pageViewSchema.index({ path: 1, day: 1 }, { unique: true });
pageViewSchema.index({ day: 1 });

module.exports = mongoose.model('PageView', pageViewSchema);
