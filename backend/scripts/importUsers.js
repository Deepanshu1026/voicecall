require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
const fs = require('fs');
const User = require('../src/models/User');

const ATLAS_URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';
const SQL_PATH = 'C:\\voicecall\\users.sql';

function parseUsers(sql) {
  const insertRegex = /INSERT\s+INTO\s+`users`\s*\([^)]+\)\s*VALUES\s*((?:.|\n)+?);/gi;
  const result = [];
  let insertMatch;
  while ((insertMatch = insertRegex.exec(sql)) !== null) {
    let valuesStr = insertMatch[1];
    valuesStr = valuesStr.replace(/\s+/g, ' ');
    const rows = [];
    let depth = 0, current = '', inString = false, stringChar = '';
    for (let i = 0; i < valuesStr.length; i++) {
      const ch = valuesStr[i], prev = i > 0 ? valuesStr[i - 1] : '';
      if (inString) { current += ch; if (ch === stringChar && prev !== '\\') inString = false; continue; }
      if (ch === "'" || ch === '"') { inString = true; stringChar = ch; current += ch; continue; }
      if (ch === '(' && depth === 0) { depth = 1; current = '('; continue; }
      if (ch === '(') { depth++; current += ch; continue; }
      if (ch === ')') { depth--; current += ch; if (depth === 0) { rows.push(current); current = ''; } continue; }
      if (depth > 0) current += ch;
    }
    for (const rowStr of rows) {
      const parts = []; let cur = ''; let instr = false; let schar = '';
      for (let i = 1; i < rowStr.length - 1; i++) {
        const ch = rowStr[i]; const prev = rowStr[i - 1];
        if (instr) { cur += ch; if (ch === schar && prev !== '\\') instr = false; continue; }
        if (ch === "'" || ch === '"') { instr = true; schar = ch; cur += ch; continue; }
        if (ch === ',') { parts.push(cur); cur = ''; continue; }
        cur += ch;
      }
      if (cur) parts.push(cur);
      if (parts.length < 19) continue;
      const un = (s) => {
        if (!s) return '';
        s = s.trim();
        if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
          s = s.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t');
        }
        return s;
      };
      const nullish = (s) => !s || s === 'NULL' || s === 'null' || s === 'N/A';
      result.push({
        sqlId: parseInt(parts[0]) || 0,
        user_name: un(parts[1]),
        user_email: un(parts[2]),
        user_password: un(parts[3]),
        country_code: nullish(parts[4]) ? null : un(parts[4]),
        user_mobile: nullish(parts[5]) ? null : un(parts[5]),
        user_profile: un(parts[6]) || 'img/userdemo.webp',
        user_status: un(parts[7]),
        user_current_status: un(parts[8]),
        user_role: un(parts[10]),
        expertise: un(parts[11]),
        language: un(parts[12]),
        experience: parseInt(parts[13]) || 0,
        total_order: parseInt(parts[14]) || 0,
        created_at: nullish(parts[15]) ? null : un(parts[15]),
        form_submitted: un(parts[16]),
        specialization: un(parts[17]),
        login_from: un(parts[18]) || 'web',
      });
    }
  }
  return result;
}

function normalizeUsername(name, sqlId) {
  let base = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (base.length < 3) base = `user${sqlId}`;
  if (base.length > 30) base = base.slice(0, 30);
  return base;
}

function isValidEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
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
  console.log('Parsing users.sql...');
  const rows = parseUsers(sql);
  console.log(`Parsed ${rows.length} users from SQL.`);

  const existingUsers = await User.find({}, { username: 1, email: 1, sqlId: 1 }).lean();
  const existingEmployees = await Employee.find({ sqlId: { $exists: true, $gt: 0 } }).select('sqlId').lean();
  const employeeSqlIds = new Set(existingEmployees.map((e) => e.sqlId));
  const existingSqlIds = new Set(existingUsers.map((u) => u.sqlId).filter(Boolean));
  const existingUsernames = new Set(existingUsers.map((u) => u.username));
  const existingEmails = new Set(existingUsers.map((u) => u.email));
  console.log(`Existing users: ${existingUsers.length}, existing employees: ${existingEmployees.length}, missing: ${rows.length - existingUsers.length}`);

  const newRows = rows.filter((r) => !existingSqlIds.has(r.sqlId) && !employeeSqlIds.has(r.sqlId));
  const skippedAsEmployee = rows.filter((r) => !existingSqlIds.has(r.sqlId) && employeeSqlIds.has(r.sqlId)).length;
  console.log(`New users to insert: ${newRows.length}`);
  console.log(`Skipped because already in Employee collection: ${skippedAsEmployee}`);

  if (newRows.length === 0) {
    console.log('No new users to import.');
    await mongoose.disconnect();
    process.exit(0);
  }

  const usersToInsert = [];
  const usernameConflicts = new Set();
  const emailConflicts = new Set();

  for (const r of newRows) {
    let username = normalizeUsername(r.user_name, r.sqlId);
    let counter = 1;
    let originalUsername = username;
    while (existingUsernames.has(username) || usernameConflicts.has(username)) {
      const suffix = `${r.sqlId}`;
      username = `${originalUsername.slice(0, 30 - suffix.length)}${suffix}`;
      if (username.length < 3) username = `user${r.sqlId}`;
      if (counter++ > 10) {
        username = `user${r.sqlId}`;
        break;
      }
    }
    usernameConflicts.add(username);

    let email = r.user_email;
    if (!isValidEmail(email) || existingEmails.has(email) || emailConflicts.has(email)) {
      email = `user${r.sqlId}@placeholder.local`;
    }
    if (emailConflicts.has(email)) {
      email = `user${r.sqlId}@placeholder.local`;
    }
    emailConflicts.add(email);

    const password = (r.user_password && r.user_password.length >= 6) ? r.user_password : 'Avisa@123';
    const role = r.user_role === 'Agent' ? 'agent' : 'user';
    const status = r.user_current_status === 'Active' || r.user_current_status === 'Oncall' ? 'online' : 'offline';
    const loginFrom = r.login_from === 'app' ? 'app' : 'web';

    const userDoc = {
      sqlId: r.sqlId,
      username,
      email,
      password,
      displayName: r.user_name || username,
      mobile: r.user_mobile ? String(r.user_mobile) : null,
      countryCode: r.country_code || '+91',
      role,
      status,
      loginFrom,
      avatar: {
        url: r.user_profile ? r.user_profile.replace(/\\/g, '/') : 'img/userdemo.webp',
        publicId: '',
      },
      bio: '',
      isVerified: r.user_status !== 'Disabled',
      createdAt: r.created_at ? new Date(r.created_at) : new Date(),
      updatedAt: r.created_at ? new Date(r.created_at) : new Date(),
    };
    usersToInsert.push(userDoc);
  }

  console.log(`Prepared ${usersToInsert.length} users for insertion.`);

  let inserted = 0;
  let failed = 0;
  const BATCH_SIZE = 200;
  for (let i = 0; i < usersToInsert.length; i += BATCH_SIZE) {
    const batch = usersToInsert.slice(i, i + BATCH_SIZE);
    try {
      await User.insertMany(batch, { ordered: false });
      inserted += batch.length;
      console.log(`Inserted batch ${i / BATCH_SIZE + 1} (${batch.length} users)`);
    } catch (err) {
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, err.message);
      if (err.writeErrors) {
        inserted += batch.length - err.writeErrors.length;
        failed += err.writeErrors.length;
      } else {
        failed += batch.length;
      }
    }
  }

  const finalCount = await User.countDocuments();
  console.log('\nImport complete.');
  console.log(`Rows parsed: ${rows.length}`);
  console.log(`Existing skipped: ${rows.length - newRows.length}`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total users in MongoDB now: ${finalCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
