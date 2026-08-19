require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const config = require('../src/config');
const User = require('../src/models/User');
const FcmToken = require('../src/models/FcmToken');

const SQL_FILE = path.resolve(process.cwd(), 'fcm_tokenscheck.sql');

function parseRows(sql) {
  // Match rows like (7, 'token...', '2025-10-13 12:50:41', 1492, ''),
  // device can be empty or 'A'/'B'.
  const regex = /\((\d+),\s*'([^']+)',\s*'([^']+)',\s*(\d+|NULL),\s*'([^']*)'\)/g;
  const rows = [];
  let match;
  while ((match = regex.exec(sql)) !== null) {
    const [, id, token, createdAt, userIdSql, device] = match;
    rows.push({
      id: parseInt(id, 10),
      token,
      createdAt: createdAt === 'NULL' || !createdAt ? new Date() : new Date(createdAt),
      userIdSql: userIdSql === 'NULL' ? null : parseInt(userIdSql, 10),
      device: device || 'A',
    });
  }
  return rows;
}

async function main() {
  const mongoUri = config.mongodbUri;
  if (!mongoUri) {
    console.error('No MongoDB URI configured. Check backend/src/config.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  if (!fs.existsSync(SQL_FILE)) {
    console.error('SQL file not found:', SQL_FILE);
    process.exit(1);
  }

  const sql = fs.readFileSync(SQL_FILE, 'utf8');
  const rows = parseRows(sql);
  console.log(`Parsed ${rows.length} rows from SQL file.`);

  // Remove duplicate tokens, keeping the first occurrence
  const seenTokens = new Set();
  const uniqueRows = [];
  for (const row of rows) {
    if (!row.token || row.token.length < 10) continue;
    if (seenTokens.has(row.token)) continue;
    seenTokens.add(row.token);
    uniqueRows.push(row);
  }
  console.log(`Unique tokens: ${uniqueRows.length}`);

  // Map SQL user ids to MongoDB users
  const sqlUserIds = uniqueRows.map((r) => r.userIdSql).filter(Boolean);
  const uniqueSqlUserIds = [...new Set(sqlUserIds)];
  const users = await User.find({ sqlId: { $in: uniqueSqlUserIds } })
    .select('_id sqlId')
    .lean();
  const userMap = new Map(users.map((u) => [u.sqlId, u._id.toString()]));
  console.log(`Found ${userMap.size} MongoDB users for ${uniqueSqlUserIds.length} SQL user ids.`);

  // Skip tokens that already exist
  const tokenList = uniqueRows.map((r) => r.token);
  const existingTokens = await FcmToken.find({ token: { $in: tokenList } })
    .select('token')
    .lean();
  const existingTokenSet = new Set(existingTokens.map((t) => t.token));
  console.log(`Already in DB: ${existingTokenSet.size}`);

  const docs = [];
  let skippedMissingUser = 0;
  let skippedExisting = 0;
  for (const row of uniqueRows) {
    if (existingTokenSet.has(row.token)) {
      skippedExisting++;
      continue;
    }
    const userId = userMap.get(row.userIdSql);
    if (!userId) {
      skippedMissingUser++;
      continue;
    }
    docs.push({
      userId,
      token: row.token,
      device: row.device || 'A',
      createdAt: row.createdAt,
      updatedAt: row.createdAt,
    });
  }

  console.log(`Skipping existing: ${skippedExisting}`);
  console.log(`Skipping missing user: ${skippedMissingUser}`);
  console.log(`To insert: ${docs.length}`);

  if (docs.length > 0) {
    const result = await FcmToken.insertMany(docs, { ordered: false });
    console.log(`Inserted ${result.length} FCM tokens.`);
  }

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
