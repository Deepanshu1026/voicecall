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

function parseInsert(sql, tableName) {
  const regex = new RegExp(
    `INSERT\\s+INTO\\s+\\\`?${tableName}\\\`?\\s*\\(([^)]+)\\)\\s*VALUES\\s*((?:\\([^)]+\\)\\s*,?\\s*)+)`,
    'gi'
  );
  const matches = [...sql.matchAll(regex)];
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
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voicecall');
    console.log('MongoDB connected');

    // --- Clear previously imported data ---
    console.log('Clearing previous import...');
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await User.deleteMany({ password: 'imported_placeholder' });
    await Employee.deleteMany({ password: 'imported_placeholder' });

    // --- Load SQL ---
    const usersSql = fs.readFileSync(USERS_SQL, 'utf8');
    const messagesSql = fs.readFileSync(MESSAGES_SQL, 'utf8');
    const sqlUsers = parseInsert(usersSql, 'users');
    const sqlMessages = parseInsert(messagesSql, 'messages');
    console.log(`Parsed ${sqlUsers.length} users, ${sqlMessages.length} messages`);

    // --- 1. Build user email -> mongoId map (existing) ---
    const sqlIdToMongoId = new Map();

    // Index existing users/employees by email
    const allExisting = {};
    for (const u of await User.find().select('email sqlId _id').lean()) {
      if (u.email) allExisting[u.email.toLowerCase()] = { _id: u._id, type: 'User', sqlId: u.sqlId };
    }
    for (const e of await Employee.find().select('email sqlId _id').lean()) {
      if (e.email && !allExisting[e.email.toLowerCase()]) {
        allExisting[e.email.toLowerCase()] = { _id: e._id, type: 'Employee', sqlId: e.sqlId };
      }
    }

    // Map SQL ids -> Mongo ids for existing records
    const userDocsToCreate = [];
    const employeeDocsToCreate = [];

    for (const su of sqlUsers) {
      const email = (su.user_email || '').trim().toLowerCase();
      const username = (su.user_name || '').trim();
      if (!email || username.length < 3) {
        continue;
      }

      const existing = allExisting[email];
      if (existing) {
        sqlIdToMongoId.set(su.id, existing._id);
        if (!existing.sqlId) {
          const Model = existing.type === 'User' ? User : Employee;
          await Model.updateOne({ _id: existing._id }, { sqlId: su.id });
        }
        continue;
      }

      const role = (su.user_role || '').trim().toLowerCase();
      const isEmp = ['agent', 'manager', 'admin', 'organizer', 'digital'].includes(role);
      const truncated = username.length > 30 ? username.slice(0, 27) + '...' : username;
      const avatar = (su.user_profile && su.user_profile !== '2345_avisa' && su.user_profile !== 'img/userdemo.webp') ? su.user_profile : undefined;

      const doc = {
        sqlId: su.id, username: truncated, email, displayName: username,
        password: 'imported_placeholder', avatar,
      };

      if (isEmp) {
        employeeDocsToCreate.push({
          ...doc, role: 'case_manager',
          status: su.user_status === 'Enable' ? 'active' : 'inactive',
          workStatus: su.user_current_status === 'Active' ? 'active' : 'unavailable',
          countryCode: su.country_code || undefined,
          mobile: su.user_mobile ? String(su.user_mobile) : undefined,
          callRate: 0, formSubmitted: su.form_submitted === 'Yes',
          specialization: su.specialization,
        });
      } else {
        userDocsToCreate.push({ ...doc, role: 'user', status: su.user_status === 'Enable' ? 'online' : 'offline', sqlId: su.id });
      }
    }

    console.log(`Creating ${userDocsToCreate.length} users, ${employeeDocsToCreate.length} employees...`);

    if (userDocsToCreate.length) {
      const created = await User.insertMany(userDocsToCreate, { ordered: false });
      created.forEach((u) => sqlIdToMongoId.set(u.sqlId, u._id));
    }
    if (employeeDocsToCreate.length) {
      const created = await Employee.insertMany(employeeDocsToCreate, { ordered: false });
      created.forEach((e) => sqlIdToMongoId.set(e.sqlId, e._id));
    }

    console.log(`User map size: ${sqlIdToMongoId.size}`);

    // --- 2. Import messages ---
    // Build unique pairs
    const pairMap = new Map();
    for (const sm of sqlMessages) {
      const key = [Math.min(sm.sender_id, sm.receiver_id), Math.max(sm.sender_id, sm.receiver_id)].join(':');
      if (!pairMap.has(key)) {
        const sid = sqlIdToMongoId.get(sm.sender_id);
        const rid = sqlIdToMongoId.get(sm.receiver_id);
        if (sid && rid) pairMap.set(key, { sid, rid });
      }
    }
    console.log(`Found ${pairMap.size} participant pairs`);

    // Create conversations
    const convInserts = [];
    for (const [key, val] of pairMap) {
      convInserts.push({ participants: [val.sid, val.rid], type: 'direct', isActive: true });
    }
    const createdConvs = await Conversation.insertMany(convInserts, { ordered: false });
    console.log(`Created ${createdConvs.length} conversations`);

    // Map pair key -> conv _id
    const keyToConvId = new Map();
    createdConvs.forEach((c, i) => {
      const keys = Array.from(pairMap.keys());
      if (i < keys.length) keyToConvId.set(keys[i], c._id);
    });

    // Build message docs
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
        content: sm.message || '',
        type: sm.file_path ? 'file' : 'text',
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
    if (msgDocs.length) {
      await Message.insertMany(msgDocs, { ordered: false });
    }

    // Update lastMessage for each conversation
    console.log('Updating lastMessage references...');
    for (const [key, convId] of keyToConvId) {
      const last = await Message.findOne({ conversation: convId }).sort({ createdAt: -1 }).select('_id').lean();
      if (last) await Conversation.updateOne({ _id: convId }, { lastMessage: last._id });
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
})();
