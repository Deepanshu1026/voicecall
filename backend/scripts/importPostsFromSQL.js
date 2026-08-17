require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const Post = require('../src/models/Post');

const SQL_PATH = 'C:\\\\voicecall\\\\posts.sql';

function deriveCategory(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('work') || t.includes('seasonal') || t.includes('lmia') || t.includes('permit')) return 'Work Visa';
  if (t.includes('tourist') || t.includes('travel') || t.includes('visitor') || t.includes('holiday')) return 'Tourist Visa';
  if (t.includes('kaveesh kapoor')) return 'Leadership';
  if (t.includes('app') || t.includes('consultation')) return 'Company News';
  if (t.includes('canada') || t.includes('uk') || t.includes('russia') || t.includes('japan') || t.includes('australia') || t.includes('hong kong') || t.includes('usa') || t.includes('europe') || t.includes('new zealand') || t.includes('schengen')) return 'Country Guides';
  return 'General';
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

function unescapeSqlString(s) {
  if (!s) return '';
  s = s.trim();
  // Remove surrounding quotes if any
  if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
    s = s.slice(1, -1);
  }
  return s
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\0/g, '\0');
}

function parsePosts(sql) {
  const insertRegex = /INSERT\s+INTO\s+`posts`\s*\([^)]+\)\s*VALUES\s*((?:.|\n)+?);/gi;
  const result = [];
  let insertMatch;
  while ((insertMatch = insertRegex.exec(sql)) !== null) {
    let valuesStr = insertMatch[1];
    valuesStr = valuesStr.replace(/\s+/g, ' ');
    const rows = [];
    let depth = 0;
    let current = '';
    let inString = false;
    let stringChar = '';
    for (let i = 0; i < valuesStr.length; i++) {
      const ch = valuesStr[i];
      const prev = i > 0 ? valuesStr[i - 1] : '';
      if (inString) {
        current += ch;
        if (ch === stringChar && prev !== '\\') inString = false;
        continue;
      }
      if (ch === "'" || ch === '"') {
        inString = true;
        stringChar = ch;
        current += ch;
        continue;
      }
      if (ch === '(' && depth === 0) {
        depth = 1;
        current = '(';
        continue;
      }
      if (ch === '(') {
        depth++;
        current += ch;
        continue;
      }
      if (ch === ')') {
        depth--;
        current += ch;
        if (depth === 0) {
          rows.push(current);
          current = '';
        }
        continue;
      }
      if (depth > 0) current += ch;
    }
    for (const rowStr of rows) {
      const parts = [];
      let cur = '';
      let instr = false;
      let schar = '';
      for (let i = 1; i < rowStr.length - 1; i++) {
        const ch = rowStr[i];
        const prev = rowStr[i - 1];
        if (instr) {
          cur += ch;
          if (ch === schar && prev !== '\\') instr = false;
          continue;
        }
        if (ch === "'" || ch === '"') {
          instr = true;
          schar = ch;
          cur += ch;
          continue;
        }
        if (ch === ',') {
          parts.push(cur);
          cur = '';
          continue;
        }
        cur += ch;
      }
      if (cur) parts.push(cur);
      if (parts.length < 10) continue;
      const [idRaw, titleRaw, contentRaw, imageRaw, createdAtRaw, updatedAtRaw, categoryIdRaw, postTimeRaw, clicksRaw, imageAltRaw] = parts;
      const id = parseInt(idRaw, 10);
      const title = unescapeSqlString(titleRaw);
      const content = unescapeSqlString(contentRaw);
      const image = unescapeSqlString(imageRaw);
      const imageAlt = unescapeSqlString(imageAltRaw);
      const createdAt = unescapeSqlString(createdAtRaw) || unescapeSqlString(postTimeRaw);
      const clicks = parseInt(clicksRaw, 10) || 0;
      result.push({
        legacyId: id,
        title,
        content,
        featuredImage: image,
        imageAlt,
        category: deriveCategory(title),
        status: 'published',
        source: 'posts',
        excerpt: stripHtml(content),
        slug: slugify(title),
        clicks,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      });
    }
  }
  return result;
}

async function main() {
  if (!fs.existsSync(SQL_PATH)) {
    console.error('SQL file not found:', SQL_PATH);
    process.exit(1);
  }

  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.ATLAS_URI;
  if (!MONGO_URI) {
    console.error('No MongoDB URI found in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  const sql = fs.readFileSync(SQL_PATH, 'utf8');
  console.log('Parsing posts.sql...');
  const posts = parsePosts(sql);
  console.log(`Parsed ${posts.length} posts.`);
  if (posts.length > 0) {
    console.log('First post:', JSON.stringify({
      legacyId: posts[0].legacyId,
      title: posts[0].title.slice(0, 60),
      createdAt: posts[0].createdAt,
      isValidDate: !Number.isNaN(posts[0].createdAt.getTime()),
    }));
  }

  if (posts.length === 0) {
    console.log('No posts found. Exiting.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // Remove existing posts imported from this source
  await Post.deleteMany({ source: 'posts' });
  console.log('Cleared existing posts from source: posts');

  const BATCH_SIZE = 100;
  let inserted = 0;
  let failed = 0;
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    try {
      const result = await Post.insertMany(batch, { ordered: false });
      inserted += result.length;
      console.log(`Inserted batch ${i / BATCH_SIZE + 1} (${result.length} posts)`);
    } catch (err) {
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, err.message);
      if (err.insertedDocs) {
        inserted += err.insertedDocs.length;
      }
      if (err.writeErrors) {
        failed += err.writeErrors.length;
      } else {
        failed += batch.length;
      }
    }
  }

  const finalCount = await Post.countDocuments();
  console.log('\nImport complete.');
  console.log(`Parsed: ${posts.length}`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total posts in MongoDB now: ${finalCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
