require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../src/models/User');
const Message = require('../src/models/Message');
const Conversation = require('../src/models/Conversation');

const sql = fs.readFileSync(path.resolve(__dirname, '..', '..', 'messages.sql'), 'utf8');

function parseInsert(sql, tableName) {
  const regex = new RegExp(
    `INSERT\\s+INTO\\s+\\\`?${tableName}\\\`?\\s*\\(([^)]+)\\)\\s*VALUES\\s*((?:\\([^)]+\\)\\s*,?\\s*)+)`,
    'gi'
  );
  const matches = [...sql.matchAll(regex)];
  if (!matches.length) throw new Error(`No INSERT for ${tableName}`);
  const headers = matches[0][1].split(',').map((h) => h.trim().replace(/`/g, ''));
  const rows = [];
  for (const m of matches) {
    const valueMatches = [...m[2].matchAll(/\(([^)]*)\)/g)];
    for (const vm of valueMatches) {
      const values = vm[1].split(',').map((v) => {
        const t = v.trim();
        if (t.startsWith("'") || t.startsWith('"')) return t.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"');
        if (/^null$/i.test(t)) return null;
        const num = Number(t);
        return isNaN(num) ? t : num;
      });
      const row = {};
      headers.forEach((h, i) => (row[h] = values[i] !== undefined ? values[i] : null));
      rows.push(row);
    }
  }
  return rows;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voicecall');
  console.log('Connected');

  const sqlMessages = parseInsert(sql, 'messages');
  console.log(`Parsed ${sqlMessages.length} messages`);

  // Build sqlId -> mongoId map from DB
  const users = await User.find({ sqlId: { $exists: true, $gt: 0 } }).select('sqlId _id').lean();
  const employees = await mongoose.connection.db.collection('employees').find({ sqlId: { $exists: true, $gt: 0 } }).project({ sqlId: 1, _id: 1 }).toArray();
  const sqlIdToMongoId = new Map();
  [...users, ...employees].forEach((u) => sqlIdToMongoId.set(Number(u.sqlId), u._id));
  console.log(`Mapping size: ${sqlIdToMongoId.size}`);

  // Build conversation pairs
  const pairMap = new Map();
  for (const sm of sqlMessages) {
    const key = [Math.min(sm.sender_id, sm.receiver_id), Math.max(sm.sender_id, sm.receiver_id)].join(':');
    if (!pairMap.has(key)) {
      const sid = sqlIdToMongoId.get(sm.sender_id);
      const rid = sqlIdToMongoId.get(sm.receiver_id);
      if (sid && rid) pairMap.set(key, { sid, rid });
    }
  }
  console.log(`Pairs: ${pairMap.size}`);

  // Create conversations
  const convDocs = [];
  for (const val of pairMap.values()) {
    convDocs.push({ participants: [val.sid, val.rid], type: 'direct', isActive: true });
  }
  const convs = await Conversation.insertMany(convDocs, { ordered: false });
  const keyToConvId = new Map();
  const keys = Array.from(pairMap.keys());
  convs.forEach((c, i) => { if (i < keys.length) keyToConvId.set(keys[i], c._id); });
  console.log(`Created ${convs.length} conversations`);

  // Build messages
  const msgDocs = [];
  let skipped = 0;
  for (const sm of sqlMessages) {
    const key = [Math.min(sm.sender_id, sm.receiver_id), Math.max(sm.sender_id, sm.receiver_id)].join(':');
    const convId = keyToConvId.get(key);
    const senderMongoId = sqlIdToMongoId.get(sm.sender_id);
    const receiverMongoId = sqlIdToMongoId.get(sm.receiver_id);
    if (!convId || !senderMongoId || !receiverMongoId) { skipped++; continue; }

    const msg = {
      conversation: convId, sender: senderMongoId, recipient: receiverMongoId,
      content: sm.message || '', type: sm.file_path ? 'file' : 'text',
      status: sm.is_read === 'Yes' ? 'seen' : (sm.status === 'Read' ? 'delivered' : 'sent'),
      createdAt: sm.created_at ? new Date(sm.created_at) : new Date(),
      updatedAt: sm.created_at ? new Date(sm.created_at) : new Date(),
    };
    if (sm.file_path) {
      msg.fileUrl = '/' + sm.file_path.replace(/\\/g, '/');
      msg.fileName = sm.file_path.split(/[/\\]/).pop();
      msg.mimeType = sm.file_type || undefined;
    }
    if (sm.is_read === 'Yes') {
      msg.readBy = [receiverMongoId];
      msg.statusTimestamps = { seen: new Date(sm.created_at || Date.now()) };
    }
    msgDocs.push(msg);
  }

  console.log(`Inserting ${msgDocs.length} messages (${skipped} skipped)...`);
  if (msgDocs.length) await Message.insertMany(msgDocs, { ordered: false });

  // Update lastMessage
  for (const [key, convId] of keyToConvId) {
    const last = await Message.findOne({ conversation: convId }).sort({ createdAt: -1 }).select('_id').lean();
    if (last) await Conversation.updateOne({ _id: convId }, { lastMessage: last._id });
  }

  const msgCount = await Message.countDocuments();
  const convCount = await Conversation.countDocuments();
  console.log(`Done. Messages: ${msgCount}, Conversations: ${convCount}`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
