require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
const fs = require('fs');
const path = require('path');
const User = require('../src/models/User');
const Message = require('../src/models/Message');
const Conversation = require('../src/models/Conversation');

const ATLAS_URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';
const SQL_PATH = path.resolve(__dirname, '..', '..', 'messages.sql');

// Parse messages by finding the VALUES block and splitting row by row
function parseMessages(sql) {
  const insertRegex = /INSERT\s+INTO\s+`messages`\s*\([^)]+\)\s*VALUES\s*((?:.|\n)+?);/gi;
  const result = [];

  let insertMatch;
  while ((insertMatch = insertRegex.exec(sql)) !== null) {
    let valuesStr = insertMatch[1];
    valuesStr = valuesStr.replace(/\s+/g, ' ');

    // Parse individual rows by tracking parenthesis depth
    const rows = [];
    let depth = 0;
    let current = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < valuesStr.length; i++) {
      const ch = valuesStr[i];
      const prev = i > 0 ? valuesStr[i-1] : '';

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

      if (ch === '(' && depth === 0) { depth = 1; current = '('; continue; }
      if (ch === '(') { depth++; current += ch; continue; }
      if (ch === ')') { depth--; current += ch; if (depth === 0) { rows.push(current); current = ''; } continue; }
      if (depth > 0) current += ch;
    }

    // Parse each row
    for (const rowStr of rows) {
      const parts = [];
      let cur = '';
      let instr = false;
      let schar = '';
      for (let i = 1; i < rowStr.length - 1; i++) {
        const ch = rowStr[i];
        const prev = rowStr[i-1];
        if (instr) {
          cur += ch;
          if (ch === schar && prev !== '\\') instr = false;
          continue;
        }
        if (ch === "'" || ch === '"') { instr = true; schar = ch; cur += ch; continue; }
        if (ch === ',') { parts.push(cur); cur = ''; continue; }
        cur += ch;
      }
      if (cur) parts.push(cur);
      if (parts.length < 7) continue;

      const un = (s) => {
        if (!s) return '';
        s = s.trim();
        if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
          s = s.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n');
        }
        return s;
      };

      result.push({
        id: parseInt(parts[0]) || 0,
        sender_id: parseInt(parts[1]) || 0,
        receiver_id: parseInt(parts[2]) || 0,
        message: un(parts[3]),
        reply_to_id: parts[4] ? parseInt(parts[4]) || null : null,
        status: un(parts[5]),
        is_read: un(parts[6]),
        created_at: parts[7] ? un(parts[7]) : null,
        file_path: parts.length > 8 ? un(parts[8]) : null,
        file_type: parts.length > 9 ? un(parts[9]) : null,
      });
    }
  }
  return result;
}

(async () => {
  await mongoose.connect(ATLAS_URI);
  console.log('Connected to Atlas');

  const sql = fs.readFileSync(SQL_PATH, 'utf8');
  const allMsgs = parseMessages(sql);
  console.log(`Parsed ${allMsgs.length} messages from SQL`);

  // Build sqlId -> mongoId map
  const users = await User.find({ sqlId: { $exists: true, $gt: 0 } }).select('sqlId _id').lean();
  const employees = await mongoose.connection.db.collection('employees').find({ sqlId: { $exists: true, $gt: 0 } }).project({ sqlId: 1, _id: 1 }).toArray();
  const sqlIdToMongoId = new Map();
  [...users, ...employees].forEach(u => sqlIdToMongoId.set(Number(u.sqlId), u._id));

  console.log(`Mapping has ${sqlIdToMongoId.size} entries`);

  // Filter to only messages where both sender and receiver have Mongo IDs
  const validMsgs = allMsgs.filter(m => {
    if (!sqlIdToMongoId.has(m.sender_id) || !sqlIdToMongoId.has(m.receiver_id)) {
      return false;
    }
    return true;
  });
  console.log(`${validMsgs.length} messages have both sender and receiver mapped`);
  console.log(`Skipped ${allMsgs.length - validMsgs.length} messages with unmapped participants`);

  // Remove old data and re-import
  console.log('Clearing old messages and conversations...');
  await Message.deleteMany({});
  await Conversation.deleteMany({});

  // Build conversation pairs
  const pairMap = new Map();
  for (const m of validMsgs) {
    const key = [Math.min(m.sender_id, m.receiver_id), Math.max(m.sender_id, m.receiver_id)].join(':');
    if (!pairMap.has(key)) {
      pairMap.set(key, {
        sid: sqlIdToMongoId.get(m.sender_id),
        rid: sqlIdToMongoId.get(m.receiver_id),
      });
    }
  }
  console.log(`Creating ${pairMap.size} conversations...`);

  const convDocs = [];
  const pairKeys = [];
  for (const [key, val] of pairMap) {
    convDocs.push({ participants: [val.sid, val.rid], type: 'direct', isActive: true });
    pairKeys.push(key);
  }
  const convs = await Conversation.insertMany(convDocs, { ordered: false });
  const keyToConvId = new Map();
  convs.forEach((c, i) => { if (i < pairKeys.length) keyToConvId.set(pairKeys[i], c._id); });
  console.log(`Created ${convs.length} conversations`);

  // Build message docs
  const msgDocs = [];
  for (const m of validMsgs) {
    const key = [Math.min(m.sender_id, m.receiver_id), Math.max(m.sender_id, m.receiver_id)].join(':');
    const convId = keyToConvId.get(key);
    if (!convId) continue;

    const senderMongoId = sqlIdToMongoId.get(m.sender_id);
    const receiverMongoId = sqlIdToMongoId.get(m.receiver_id);

    const hasFilePath = m.file_path && m.file_path !== 'NULL' && m.file_path !== 'null' && m.file_path !== 'N/A';
    const msg = {
      conversation: convId, sender: senderMongoId, recipient: receiverMongoId,
      content: m.message || '', type: hasFilePath ? 'file' : 'text',
      status: m.is_read === 'Yes' ? 'seen' : (m.status === 'Read' ? 'delivered' : 'sent'),
      createdAt: m.created_at ? new Date(m.created_at) : new Date(),
      updatedAt: m.created_at ? new Date(m.created_at) : new Date(),
    };
    if (hasFilePath) {
      msg.fileUrl = '/' + m.file_path.replace(/\\/g, '/');
      msg.fileName = m.file_path.split(/[/\\]/).pop();
      msg.mimeType = m.file_type || undefined;
    }
    if (m.is_read === 'Yes') {
      msg.readBy = [receiverMongoId];
      msg.statusTimestamps = { seen: new Date(m.created_at || Date.now()) };
    }
    msgDocs.push(msg);
  }

  console.log(`Inserting ${msgDocs.length} messages...`);
  if (msgDocs.length) await Message.insertMany(msgDocs, { ordered: false });

  // Update lastMessage
  let updated = 0;
  for (const [key, convId] of keyToConvId) {
    const last = await Message.findOne({ conversation: convId }).sort({ createdAt: -1 }).select('_id').lean();
    if (last) { await Conversation.updateOne({ _id: convId }, { lastMessage: last._id }); updated++; }
  }
  console.log(`Updated lastMessage for ${updated} conversations`);

  // Count Bhumi's conversations
  const bhumi = await mongoose.connection.db.collection('employees').findOne({ email: 'bhumirajj.07@gmail.com' });
  if (bhumi) {
    const bhumiConvs = await Conversation.countDocuments({ participants: bhumi._id });
    const bhumiMsgIds = (await Conversation.find({ participants: bhumi._id }).select('_id').lean()).map(c => c._id);
    const bhumiMsgs = await Message.countDocuments({ conversation: { $in: bhumiMsgIds } });
    console.log(`\nBhumi now has ${bhumiConvs} conversations with ${bhumiMsgs} messages`);
  }

  await mongoose.disconnect();
  console.log('\nDone!');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
