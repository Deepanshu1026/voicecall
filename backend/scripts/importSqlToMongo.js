/*
  Import users and messages from SQL dumps into MongoDB

  Usage:
    node scripts/importSqlToMongo.js

  Expects files:
    users.sql      – table `users` with columns (id, user_name, user_email, ...)
    messages.sql   – table `messages` with columns (id, sender_id, receiver_id, message, ...)
*/
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Message = require('../src/models/Message');
const Conversation = require('../src/models/Conversation');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const USERS_SQL = path.join(PROJECT_ROOT, 'users (1).sql');
const MESSAGES_SQL = path.join(PROJECT_ROOT, 'messages.sql');

// ----- Helpers --------------------------------------------------------------

/** Parse a MySQL INSERT INTO ... VALUES (...), (...) string into rows */
function parseInsert(sql, tableName) {
  const regex = new RegExp(
    `INSERT\\s+INTO\\s+\\\`?${tableName}\\\`?\\s*\\(([^)]+)\\)\\s*VALUES\\s*((?:\\([^)]+\\)\\s*,?\\s*)+)`,
    'gi'
  );
  const matches = [...sql.matchAll(regex)];
  if (!matches.length) throw new Error(`No INSERT INTO \`${tableName}\` found`);

  // column names from the first match
  const headers = matches[0][1]
    .split(',')
    .map((h) => h.trim().replace(/`/g, ''));

  const rows = [];
  for (const m of matches) {
    const valuesBlock = m[2];
    const valueMatches = [...valuesBlock.matchAll(/\(([^)]*)\)/g)];
    for (const vm of valueMatches) {
      const values = vm[1].split(',').map((v) => {
        const t = v.trim();
        // string literal
        if (t.startsWith("'") || t.startsWith('"')) {
          const str = t.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"');
          return str;
        }
        // NULL
        if (t === 'NULL' || t === 'null') return null;
        // number
        return Number(t);
      });
      const row = {};
      headers.forEach((h, i) => {
        row[h] = values[i] !== undefined ? values[i] : null;
      });
      rows.push(row);
    }
  }
  return rows;
}

// ----- Main -----------------------------------------------------------------

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voicecall');
    console.log('MongoDB connected');

    // Clean slate for documents created by this script
    console.log('Clearing previous import data...');
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    // Remove Users and Employees that were created by this script (have password 'imported_placeholder')
    await User.deleteMany({ password: 'imported_placeholder' });
    await Employee.deleteMany({ password: 'imported_placeholder' });

    // --------------------------------------------------
    // 1. Import users
    // --------------------------------------------------
    const usersSql = fs.readFileSync(USERS_SQL, 'utf8');
    const sqlUsers = parseInsert(usersSql, 'users');
    console.log(`\nParsed ${sqlUsers.length} users from SQL`);

    const sqlIdToMongoId = new Map();

    for (const su of sqlUsers) {
      try {
        const originalId = su.id;
        const email = (su.user_email || '').trim().toLowerCase();
        const username = (su.user_name || '').trim();

        if (!email) { console.log(`  Skipping id ${originalId} — no email`); continue; }
        if (username.length < 3) { console.log(`  Skipping id ${originalId} — username "${username}" too short`); continue; }

        // Find existing user/employee by exact email
        let existing = await User.findOne({ email }).collation({ locale: 'en', strength: 2 });
        if (!existing) existing = await Employee.findOne({ email }).collation({ locale: 'en', strength: 2 });

        if (existing) {
          sqlIdToMongoId.set(originalId, existing._id);
          if (!existing.sqlId) {
            const Model = existing.constructor.modelName === 'User' ? User : Employee;
            await Model.updateOne({ _id: existing._id }, { sqlId: originalId });
          }
          continue;
        }

        const role = (su.user_role || '').trim().toLowerCase();
        const isEmp = ['agent', 'manager', 'admin', 'organizer', 'digital'].includes(role);
        const truncatedUser = username.length > 30 ? username.slice(0, 27) + '...' : username;
        const avatar = (su.user_profile && su.user_profile !== '2345_avisa' && su.user_profile !== 'img/userdemo.webp') ? su.user_profile : undefined;

        const doc = {
          sqlId: originalId, username: truncatedUser, email, displayName: username,
          password: 'imported_placeholder',
          avatar,
        };

      let created;
      if (isEmp) {
        created = await Employee.create({
          ...doc, role: 'case_manager',
          status: su.user_status === 'Enable' ? 'active' : 'inactive',
          workStatus: su.user_current_status === 'Active' ? 'active' : 'unavailable',
          countryCode: su.country_code || undefined,
          mobile: su.user_mobile ? String(su.user_mobile) : undefined,
          callRate: 0, formSubmitted: su.form_submitted === 'Yes',
          specialization: su.specialization,
        });
      } else {
        created = await User.create({ ...doc, role: 'user', status: su.user_status === 'Enable' ? 'online' : 'offline', sqlId: originalId });
      }
        sqlIdToMongoId.set(originalId, created._id);
        console.log(`  Created ${isEmp ? 'Employee' : 'User'}: ${username} (${email})`);
      } catch (err) {
        console.log(`  Skipping id ${su.id} — ${err.message.split('\n')[0]}`);
      }
    }

    console.log(`\nUser mapping has ${sqlIdToMongoId.size} entries`);

    // --------------------------------------------------
    // 2. Import messages
    // --------------------------------------------------
    const messagesSql = fs.readFileSync(MESSAGES_SQL, 'utf8');
    const sqlMessages = parseInsert(messagesSql, 'messages');
    console.log(`\nParsed ${sqlMessages.length} messages from SQL`);

    // Build a map of unique participant pairs -> conversation
    const pairToConvId = new Map();
    const getPairKey = (a, b) => [Math.min(a, b), Math.max(a, b)].join(':');

    // First pass: collect all unique pairs
    const pairs = new Set();
    for (const sm of sqlMessages) {
      pairs.add(getPairKey(sm.sender_id, sm.receiver_id));
    }
    console.log(`Found ${pairs.size} unique participant pairs`);

    // Create conversations for each pair that has valid Mongo IDs
    const pairDocs = [];
    for (const pair of pairs) {
      const [a, b] = pair.split(':').map(Number);
      const sid = sqlIdToMongoId.get(a);
      const rid = sqlIdToMongoId.get(b);
      if (!sid || !rid) {
        console.warn(`Skipping pair ${pair} — unmapped SQL IDs`);
        continue;
      }
      pairDocs.push({ key: pair, sid, rid });
    }
    console.log(`Preparing ${pairDocs.length} conversations`);

    // Create conversations in bulk
    const convDocs = [];
    for (const p of pairDocs) {
      convDocs.push({
        participants: [p.sid, p.rid],
        type: 'direct',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (convDocs.length) {
      const createdConvs = await Conversation.insertMany(convDocs, { ordered: false });
      console.log(`Created ${createdConvs.length} conversations`);
      createdConvs.forEach((c, i) => {
        const key = getPairKey(c.participants[0].toString(), c.participants[1].toString());
        // Actually we need the numeric sqlId pairs as keys, but conversations store ObjectIds now.
        // Use the original pairDocs lookup.
        if (i < pairDocs.length) {
          pairToConvId.set(pairDocs[i].key, c._id);
        }
      });
    }

    // Second pass: build message docs in memory, then bulk insert
    console.log('Building message documents...');
    const msgDocs = [];
    let skippedMsgCount = 0;

    for (const sm of sqlMessages) {
      const key = getPairKey(sm.sender_id, sm.receiver_id);
      const convId = pairToConvId.get(key);
      if (!convId) { skippedMsgCount++; continue; }

      const senderMongoId = sqlIdToMongoId.get(sm.sender_id);
      const receiverMongoId = sqlIdToMongoId.get(sm.receiver_id);

      if (!senderMongoId || !receiverMongoId) { skippedMsgCount++; continue; }

      const msgDoc = {
        conversation: convId,
        sender: senderMongoId,
        recipient: receiverMongoId,
        content: sm.message || '',
        type: sm.file_path ? 'file' : 'text',
        status: sm.is_read === 'Yes' ? 'seen' : (sm.status === 'Read' ? 'delivered' : 'sent'),
        createdAt: sm.created_at ? new Date(sm.created_at) : new Date(),
        updatedAt: sm.created_at ? new Date(sm.created_at) : new Date(),
      };

      if (sm.file_path) {
        msgDoc.fileUrl = '/' + sm.file_path.replace(/\\/g, '/');
        msgDoc.fileName = sm.file_path.split(/[/\\]/).pop();
        msgDoc.mimeType = sm.file_type || undefined;
      }

      if (sm.is_read === 'Yes') {
        msgDoc.readBy = [receiverMongoId];
        msgDoc.statusTimestamps = { seen: new Date(sm.created_at || Date.now()) };
      }

      msgDocs.push(msgDoc);
    }

    console.log(`Inserting ${msgDocs.length} messages (${skippedMsgCount} skipped)...`);
    if (msgDocs.length) {
      await Message.insertMany(msgDocs, { ordered: false });
    }
    console.log(`Done: ${msgDocs.length} messages imported`);

    // Update conversation lastMessage for each conversation
    console.log('Updating conversation lastMessage references...');
    for (const [pair, convId] of pairToConvId) {
      const lastMsg = await Message.findOne({ conversation: convId })
        .sort({ createdAt: -1 })
        .limit(1)
        .select('_id');
      if (lastMsg) {
        await Conversation.updateOne({ _id: convId }, { lastMessage: lastMsg._id });
      }
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
