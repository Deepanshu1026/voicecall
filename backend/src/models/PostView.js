const mongoose = require('mongoose');

// One document per post per day, so the admin can see views trend day by day.
const postViewSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    day: { type: String, required: true }, // YYYY-MM-DD (UTC)
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postViewSchema.index({ post: 1, day: 1 }, { unique: true });
postViewSchema.index({ day: 1 });

module.exports = mongoose.model('PostView', postViewSchema);
