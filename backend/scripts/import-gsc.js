/**
 * Import a Google Search Console "Performance on Search" export (.xlsx) and store
 * the per-page clicks / impressions / CTR / position on the matching blog posts.
 *
 * Usage:  node scripts/import-gsc.js "C:\\path\\to\\avisaexperts.com-Performance-on-Search-YYYY-MM-DD.xlsx"
 *
 * No dependencies: .xlsx is a zip of XML, so this reads the zip, the shared
 * strings and the "Pages" sheet directly.
 */
require('dotenv').config();
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const mongoose = require('mongoose');
const Post = require('../src/models/Post');

// ---------- minimal zip reader ----------
function readZip(file) {
  const buf = fs.readFileSync(file);
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i >= buf.length - 66000; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('Not a valid .xlsx (zip) file');
  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);
  const files = {};
  for (let n = 0; n < count; n += 1) {
    if (buf.readUInt32LE(off) !== 0x02014b50) break;
    const method = buf.readUInt16LE(off + 10);
    const compSize = buf.readUInt32LE(off + 20);
    const fnLen = buf.readUInt16LE(off + 28);
    const exLen = buf.readUInt16LE(off + 30);
    const cmLen = buf.readUInt16LE(off + 32);
    const localOff = buf.readUInt32LE(off + 42);
    const name = buf.toString('utf8', off + 46, off + 46 + fnLen);
    const lfn = buf.readUInt16LE(localOff + 26);
    const lex = buf.readUInt16LE(localOff + 28);
    const dataStart = localOff + 30 + lfn + lex;
    const raw = buf.subarray(dataStart, dataStart + compSize);
    files[name] = method === 8 ? zlib.inflateRawSync(raw) : raw;
    off += 46 + fnLen + exLen + cmLen;
  }
  return files;
}

const unescapeXml = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

const colToIdx = (ref) => {
  const letters = ref.replace(/[0-9]/g, '');
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
};

function parseSheet(xml, shared) {
  const rows = [];
  for (const rm of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = [];
    for (const cm of rm[1].matchAll(/<c r="([A-Z]+\d+)"([^>]*)>([\s\S]*?)<\/c>/g)) {
      let val = (cm[3].match(/<v>([\s\S]*?)<\/v>/) || [])[1] ?? '';
      if (/t="s"/.test(cm[2])) val = shared[Number(val)] ?? '';
      else if (/t="inlineStr"/.test(cm[2])) val = (cm[3].match(/<t[^>]*>([\s\S]*?)<\/t>/) || [])[1] ?? '';
      cells[colToIdx(cm[1])] = unescapeXml(String(val));
    }
    rows.push(cells);
  }
  return rows;
}

(async () => {
  const file = process.argv[2];
  if (!file || !fs.existsSync(file)) {
    console.error('Pass the path to the .xlsx export.');
    process.exit(1);
  }

  const files = readZip(file);
  const sharedXml = files['xl/sharedStrings.xml'] ? files['xl/sharedStrings.xml'].toString('utf8') : '';
  const shared = [...sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join('')
  );

  // find the sheet named "Pages" (name -> rel id -> target file)
  const wb = files['xl/workbook.xml'].toString('utf8');
  const rels = files['xl/_rels/workbook.xml.rels'].toString('utf8');
  const sheetTags = [...wb.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="rId(\d+)"/g)].map((m) => ({ name: m[1], rid: m[2] }));
  const pages = sheetTags.find((s) => /^pages$/i.test(s.name.trim()));
  if (!pages) {
    console.error('No "Pages" sheet found. Sheets:', sheetTags.map((s) => s.name).join(', '));
    process.exit(1);
  }
  const target = (rels.match(new RegExp(`Id="rId${pages.rid}"[^>]*Target="([^"]+)"`)) || [])[1];
  const sheetPath = `xl/${String(target).replace(/^\/?xl\//, '')}`;
  const rows = parseSheet(files[sheetPath].toString('utf8'), shared).slice(1).filter((r) => r[0]);

  await mongoose.connect(process.env.MONGODB_URI);
  const posts = await Post.find({}).select('slug title').lean();
  const bySlug = new Map(posts.map((p) => [p.slug, p]));

  const syncedAt = new Date();
  let matched = 0;
  const unmatched = [];

  for (const r of rows) {
    const url = String(r[0] || '');
    if (!/\/blog\//.test(url)) continue;
    const slug = url.split('/blog/')[1].split(/[?#]/)[0].replace(/\/+$/, '');
    const post = bySlug.get(slug);
    const gsc = {
      clicks: Math.round(Number(r[1]) || 0),
      impressions: Math.round(Number(r[2]) || 0),
      ctr: Number(r[3]) || 0,
      position: Number(r[4]) || 0,
      syncedAt,
    };
    if (!post) {
      unmatched.push({ slug, ...gsc });
      continue;
    }
    await Post.updateOne({ _id: post._id }, { $set: { gsc } });
    matched += 1;
    console.log(`  ${String(gsc.clicks).padStart(4)} clicks  ${String(gsc.impressions).padStart(6)} impr  pos ${gsc.position.toFixed(1).padStart(5)}  ${slug}`);
  }

  console.log(`\n  matched ${matched} blog post(s)`);
  if (unmatched.length) {
    console.log('  not matched (slug no longer exists):');
    unmatched.forEach((u) => console.log(`    ${u.slug} (${u.clicks} clicks)`));
  }
  await mongoose.disconnect();
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
