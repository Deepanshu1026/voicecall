const mongoose = require('mongoose');
const fs = require('fs');
const Post = require('./src/models/Post');

const unifiedPostsPath = '../../unified_posts.json';

async function importPosts() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/voicecall';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const raw = fs.readFileSync(unifiedPostsPath, 'utf-8');
    const posts = JSON.parse(raw);

    // Clear existing posts
    await Post.deleteMany({ source: { $in: ['posts', 'blog_posts'] } });
    console.log('Cleared existing imported posts');

    // Insert new posts
    const docs = posts.map((p) => ({
      legacyId: p.legacyId,
      title: p.title,
      slug: p.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, ''),
      content: p.content,
      excerpt: p.excerpt,
      featuredImage: p.featuredImage,
      imageAlt: p.imageAlt,
      category: p.category,
      status: p.status,
      source: p.source,
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    }));

    const result = await Post.insertMany(docs);
    console.log(`Imported ${result.length} posts successfully`);
  } catch (err) {
    console.error('Import failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

importPosts();
