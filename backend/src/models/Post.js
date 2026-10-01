const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  legacyId: { type: Number, default: null },
  title: { type: String, required: true },
  slug: { type: String, default: '' },
  content: { type: String, default: '' },
  excerpt: { type: String, default: '' },
  featuredImage: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  category: { type: String, default: 'General' },
  tags: { type: [String], default: [] },
  author: { type: String, default: 'A Visa Experts' },
  // SEO fields
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  metaKeywords: { type: String, default: '' },
  canonicalUrl: { type: String, default: '' },
  publishedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'published' },
  source: { type: String, default: '' },
  clicks: { type: Number, default: 0 },
}, {
  timestamps: true,
});

postSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
postSchema.index({ category: 1 });
postSchema.index({ status: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
