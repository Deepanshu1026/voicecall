require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
const fs = require('fs');
const path = require('path');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Message = require('../src/models/Message');
const Conversation = require('../src/models/Conversation');

const ATLAS_URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';
const SQL_PATH = path.resolve(__dirname, '..', '..', 'messages.sql');

function isEscapedQuote(sql, i) {
  // Count consecutive backslashes immediately before the quote at i
  let backslashes = 0;
  let j = i - 1;
  while (j >= 0 && sql[j] === '\\') {
    backslashes++;
    j--;
  }
  return (backslashes % 2) === 1;
}

function unescapeSqlString(s) {
  if (!s) return '';
  s = s.trim();
  if (s.startsWith("'") && s.endsWith("'")) {
    s = s.slice(1, -1);
  }
  let result = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const next = s[i + 1];
    if (ch === '\\' && next !== undefined) {
      if (next === 'n') { result += '\n'; i++; }
      else if (next === 'r') { result += '\r'; i++; }
      else if (next === 't') { result += '\t'; i++; }
      else if (next === 'b') { result += '\b'; i++; }
      else if (next === 'Z') { result += '\x1A'; i++; }
      else if (next === "'") { result += "'"; i++; }
      else if (next === '"') { result += '"'; i++; }
      else if (next === '\\') { result += '\\'; i++; }
      else { result += next; i++; }
    } else if (ch === "'" && next === "'") {
      result += "'";
      i++;
    } else {
      result += ch;
    }
  }
  return result;
}

function parseMessages(sql) {
  const result = [];
  const startRegex = /INSERT\s+INTO\s+`messages`\s*\(/gi;

  let startMatch;
  while ((startMatch = startRegex.exec(sql)) !== null) {
    // Find the VALUES keyword after the column list
    let valuesIdx = sql.indexOf('VALUES', startMatch.index);
    if (valuesIdx === -1) continue;
    let i = valuesIdx + 6;
    // Skip whitespace until opening parenthesis
    while (i < sql.length && /\s/.test(sql[i])) i++;
    if (sql[i] !== '(') continue;

    // Parse the values block, tracking parentheses and string boundaries
    const rows = [];
    let depth = 0;
    let current = '';
    let inString = false;
    let stringChar = '';

    for (; i < sql.length; i++) {
      const ch = sql[i];

      if (inString) {
        current += ch;
        if (ch === stringChar) {
          // MySQL double single-quote escape ('') means a literal quote
          if (sql[i + 1] === stringChar) {
            current += sql[i + 1];
            i++;
          } else if (!isEscapedQuote(sql, i)) {
            inString = false;
          }
        }
        continue;
      }

      if (ch === "'") {
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
          // Skip following comma and whitespace; detect end of values clause
          let j = i + 1;
          while (j < sql.length && /\s/.test(sql[j])) j++;
          if (sql[j] === ',') {
            i = j;
            continue;
          }
          if (sql[j] === ';') {
            i = j;
            break;
          }
          // Otherwise continue
          i = j - 1;
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
      for (let j = 1; j < rowStr.length - 1; j++) {
        const ch = rowStr[j];
        if (instr) {
          cur += ch;
          if (ch === schar) {
            if (rowStr[j + 1] === schar) {
              cur += rowStr[j + 1];
              j++;
            } else if (!isEscapedQuote(rowStr, j)) {
              instr = false;
            }
          }
          continue;
        }
        if (ch === "'") { instr = true; schar = ch; cur += ch; continue; }
        if (ch === ',') { parts.push(cur); cur = ''; continue; }
        cur += ch;
      }
      if (cur) parts.push(cur);
      if (parts.length < 8) continue;

      const un = unescapeSqlString;

      const nullish = (s) => !s || s === 'NULL' || s === 'null' || s === 'N/A';

      result.push({
        id: parseInt(parts[0]) || 0,
        sender_id: parseInt(parts[1]) || 0,
        receiver_id: parseInt(parts[2]) || 0,
        message: un(parts[3]),
        reply_to_id: nullish(parts[4]) ? null : parseInt(parts[4]) || null,
        status: un(parts[5]),
        is_read: un(parts[6]),
        created_at: nullish(parts[7]) ? null : un(parts[7]),
        file_path: nullish(parts[8]) ? null : un(parts[8]),
        file_type: nullish(parts[9]) ? null : un(parts[9]),
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

  console.log('Connecting to MongoDB...');
  await mongoose.connect(ATLAS_URI);
  console.log('Connected.');

  const sql = fs.readFileSync(SQL_PATH, 'utf8');
  console.log('Parsing SQL file...');
  const allMsgs = parseMessages(sql);
  console.log(`Parsed ${allMsgs.length} messages from SQL.`);

  const users = await User.find({ sqlId: { $exists: true, $gt: 0 } }).select('sqlId _id').lean();
  const employees = await Employee.find({ sqlId: { $exists: true, $gt: 0 } }).select('sqlId _id').lean();
  const sqlIdToMongoId = new Map();
  [...users, ...employees].forEach((u) => sqlIdToMongoId.set(Number(u.sqlId), u._id));
  console.log(`User/employee mapping has ${sqlIdToMongoId.size} entries.`);

  const validMsgs = allMsgs.filter((m) => sqlIdToMongoId.has(m.sender_id) && sqlIdToMongoId.has(m.receiver_id));
  console.log(`${validMsgs.length} messages have both sender and receiver mapped.`);
  console.log(`Skipped ${allMsgs.length - validMsgs.length} messages with unmapped participants.`);

  // Build existing message lookup by (sender:recipient:createdAtMs:content)
  console.log('Loading existing messages for deduplication...');
  const existingMsgCount = await Message.countDocuments();
  const existingMsgCursor = Message.find({}).select('sender recipient createdAt content sqlId').cursor();
  const existingMsgMap = new Map();
  const existingSqlIds = new Set();
  for await (const msg of existingMsgCursor) {
    const key = `${msg.sender.toString()}:${msg.recipient.toString()}:${msg.createdAt.getTime()}:${msg.content || ''}`;
    if (!existingMsgMap.has(key)) existingMsgMap.set(key, msg);
    if (msg.sqlId) existingSqlIds.add(msg.sqlId);
  }
  console.log(`Loaded ${existingMsgMap.size} existing messages (sqlId tracked: ${existingSqlIds.size}).`);

  // Compute all conversation keys we need
  const pairToConv = new Map();
  const pairKeys = new Set();
  for (const m of validMsgs) {
    const sid = sqlIdToMongoId.get(m.sender_id);
    const rid = sqlIdToMongoId.get(m.receiver_id);
    const key = [sid.toString(), rid.toString()].sort().join(':');
    pairKeys.add(key);
  }

  // Load existing conversations
  const allPairKeys = Array.from(pairKeys);
  const BATCH = 2000;
  for (let i = 0; i < allPairKeys.length; i += BATCH) {
    const batch = allPairKeys.slice(i, i + BATCH);
    const convs = await Conversation.find({
      type: 'direct',
      participants: { $size: 2 },
      $or: batch.map((k) => {
        const [a, b] = k.split(':');
        return { participants: { $all: [new mongoose.Types.ObjectId(a), new mongoose.Types.ObjectId(b)] } };
      }),
    }).lean();
    for (const c of convs) {
      const key = c.participants.map((p) => p.toString()).sort().join(':');
      pairToConv.set(key, c._id);
    }
  }
  console.log(`Found ${pairToConv.size} existing conversations for SQL pairs.`);

  // Create missing conversations
  const convsToCreate = [];
  const newConvKeys = [];
  for (const m of validMsgs) {
    const sid = sqlIdToMongoId.get(m.sender_id);
    const rid = sqlIdToMongoId.get(m.receiver_id);
    const key = [sid.toString(), rid.toString()].sort().join(':');
    if (!pairToConv.has(key)) {
      convsToCreate.push({ participants: [sid, rid], type: 'direct', isActive: true });
      newConvKeys.push(key);
      pairToConv.set(key, null); // placeholder
    }
  }

  if (convsToCreate.length > 0) {
    console.log(`Creating ${convsToCreate.length} new conversations...`);
    const created = await Conversation.insertMany(convsToCreate, { ordered: false });
    for (let i = 0; i < created.length; i++) {
      pairToConv.set(newConvKeys[i], created[i]._id);
    }
    console.log(`Created ${created.length} conversations.`);
  }

  // Process messages: match existing or insert new
  const msgDocs = [];
  const sqlIdsToUpdate = [];
  const convsToUpdate = new Set();
  let matched = 0;
  let alreadyHaveSqlId = 0;
  let missingParticipants = 0;

  for (const m of validMsgs) {
    if (existingSqlIds.has(m.id)) {
      alreadyHaveSqlId++;
      continue;
    }

    const senderMongoId = sqlIdToMongoId.get(m.sender_id);
    const receiverMongoId = sqlIdToMongoId.get(m.receiver_id);
    const key = [senderMongoId.toString(), receiverMongoId.toString()].sort().join(':');
    const convId = pairToConv.get(key);
    if (!convId) {
      missingParticipants++;
      continue;
    }

    const createdAtMs = m.created_at ? new Date(m.created_at).getTime() : Date.now();
    const matchKey = `${senderMongoId.toString()}:${receiverMongoId.toString()}:${createdAtMs}:${m.message || ''}`;

    if (existingMsgMap.has(matchKey)) {
      const existing = existingMsgMap.get(matchKey);
      if (!existing.sqlId) {
        sqlIdsToUpdate.push({ id: existing._id, sqlId: m.id });
      }
      matched++;
      continue;
    }

    const hasFilePath = m.file_path && m.file_path !== 'NULL' && m.file_path !== 'null' && m.file_path !== 'N/A';
    const msgDoc = {
      sqlId: m.id,
      conversation: convId,
      sender: senderMongoId,
      recipient: receiverMongoId,
      content: m.message || '',
      type: hasFilePath ? 'file' : 'text',
      status: m.is_read === 'Yes' ? 'seen' : (m.status === 'Read' ? 'delivered' : 'sent'),
      createdAt: m.created_at ? new Date(m.created_at) : new Date(),
      updatedAt: m.created_at ? new Date(m.created_at) : new Date(),
    };
    if (hasFilePath) {
      msgDoc.fileUrl = '/' + m.file_path.replace(/\\/g, '/');
      msgDoc.fileName = m.file_path.split(/[/\\]/).pop();
      msgDoc.mimeType = m.file_type || undefined;
    }
    if (m.is_read === 'Yes') {
      msgDoc.readBy = [receiverMongoId];
      msgDoc.statusTimestamps = { seen: new Date(m.created_at || Date.now()) };
    }

    msgDocs.push(msgDoc);
    convsToUpdate.add(convId.toString());
  }

  console.log(`Matched to existing messages (sqlId assigned): ${matched}`);
  console.log(`Already have sqlId: ${alreadyHaveSqlId}`);
  console.log(`Missing participant mapping: ${missingParticipants}`);
  console.log(`New messages to insert: ${msgDocs.length}`);

  // Update sqlId for matched existing messages
  if (sqlIdsToUpdate.length > 0) {
    console.log(`Updating ${sqlIdsToUpdate.length} existing messages with sqlId...`);
    const UPDATE_BATCH = 500;
    let updated = 0;
    for (let i = 0; i < sqlIdsToUpdate.length; i += UPDATE_BATCH) {
      const batch = sqlIdsToUpdate.slice(i, i + UPDATE_BATCH);
      const bulkOps = batch.map((item) => ({
        updateOne: { filter: { _id: item.id }, update: { $set: { sqlId: item.sqlId } } },
      }));
      const result = await Message.bulkWrite(bulkOps, { ordered: false });
      updated += result.modifiedCount;
    }
    console.log(`Updated ${updated} existing messages with sqlId.`);
  }

  // Insert new messages
  let inserted = 0;
  let failed = 0;
  const INSERT_BATCH = 500;
  for (let i = 0; i < msgDocs.length; i += INSERT_BATCH) {
    const batch = msgDocs.slice(i, i + INSERT_BATCH);
    try {
      await Message.insertMany(batch, { ordered: false });
      inserted += batch.length;
      console.log(`Inserted batch ${i / INSERT_BATCH + 1} (${batch.length} messages)`);
    } catch (err) {
      if (err.writeErrors) {
        inserted += batch.length - err.writeErrors.length;
        failed += err.writeErrors.length;
      } else {
        failed += batch.length;
      }
      console.error(`Batch ${i / INSERT_BATCH + 1} error:`, err.message);
    }
  }

  // Update lastMessage for conversations that received new messages
  const convIds = Array.from(convsToUpdate).map((id) => new mongoose.Types.ObjectId(id));
  if (convIds.length > 0) {
    console.log(`Updating lastMessage for ${convIds.length} conversations...`);
    let updated = 0;
    for (const convId of convIds) {
      const last = await Message.findOne({ conversation: convId }).sort({ createdAt: -1 }).select('_id').lean();
      if (last) {
        await Conversation.updateOne({ _id: convId }, { lastMessage: last._id });
        updated++;
      }
    }
    console.log(`Updated lastMessage for ${updated} conversations.`);
  }

  const finalCount = await Message.countDocuments();
  console.log('\nImport complete.');
  console.log(`SQL rows parsed: ${allMsgs.length}`);
  console.log(`Mapped messages: ${validMsgs.length}`);
  console.log(`Matched existing messages (sqlId assigned): ${matched}`);
  console.log(`Already imported (sqlId exists): ${alreadyHaveSqlId}`);
  console.log(`New messages inserted: ${inserted}`);
  console.log(`Insert failures: ${failed}`);
  console.log(`Total messages in MongoDB: ${finalCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

module.exports = { parseMessages, unescapeSqlString };

if (require.main === module) {
  main().catch((err) => {
    console.error('Import failed:', err);
    process.exit(1);
  });
}
