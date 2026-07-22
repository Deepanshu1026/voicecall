require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const config = require('../src/config');
const Employee = require('../src/models/Employee');

const SQL_FILE = process.env.AGENT_SQL_FILE || path.join('C:', 'Users', 'chair', 'OneDrive', 'Desktop', 'voicecall', 'agent.sql');

function parseRow(row) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === "'") {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  values.push(current.trim());
  return values.map((v) => {
    if (v === 'NULL') return null;
    if (v.startsWith("'") && v.endsWith("'")) {
      return v.slice(1, -1).replace(/\\'/g, "'");
    }
    if (!isNaN(Number(v)) && v !== '') return Number(v);
    return v;
  });
}

function normalizeAvatar(avatar) {
  if (!avatar || typeof avatar !== 'string') return '/images/user/userdemo.webp';
  return avatar.replace(/\\/g, '/').trim();
}

function mapEmployee(values) {
  const [
    sqlId,
    displayName,
    email,
    password,
    countryCode,
    mobile,
    avatar,
    userStatus,
    userCurrentStatus,
    sessionToken,
    // eslint-disable-next-line no-unused-vars
    _sqlRole,
    expertise,
    language,
    experience,
    totalOrder,
    createdAt,
    formSubmitted,
    specialization,
    loginFrom,
  ] = values;

  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanUsername = cleanEmail.split('@')[0].replace(/[^a-z0-9]/gi, '_') + '_' + sqlId;

  return {
    sqlId,
    username: cleanUsername,
    email: cleanEmail,
    password: String(password),
    displayName: String(displayName || '').trim(),
    avatar: normalizeAvatar(avatar),
    countryCode: countryCode ? String(countryCode) : '+91',
    mobile: mobile ? String(mobile) : '',
    status: userStatus === 'Enable' ? 'active' : 'inactive',
    workStatus: 'unavailable',
    role: 'case_manager',
    expertise: String(expertise || ''),
    languages: String(language || ''),
    experience: Number(experience) || 0,
    totalOrder: Number(totalOrder) || 0,
    formSubmitted: formSubmitted === 'Yes',
    specialization: String(specialization || ''),
    loginFrom: loginFrom === 'app' ? 'app' : 'web',
    sessionToken: sessionToken || null,
    createdAt: createdAt ? new Date(createdAt) : new Date(),
  };
}

async function importAgents() {
  try {
    if (!fs.existsSync(SQL_FILE)) {
      throw new Error(`SQL file not found: ${SQL_FILE}`);
    }

    const sql = fs.readFileSync(SQL_FILE, 'utf8');
    const match = sql.match(/INSERT INTO `users` \([^)]+\) VALUES\s+([\s\S]+?);/);
    if (!match) throw new Error('Could not find INSERT statement in SQL file');

    let rowsText = match[1].trim();
    if (rowsText.startsWith('(')) rowsText = rowsText.slice(1);
    if (rowsText.endsWith(')')) rowsText = rowsText.slice(0, -1);

    const rows = rowsText
      .split(/\),\s*\(/)
      .map((row) => row.replace(/^[\s(]+|[\s);]+$/g, ''));

    const employees = rows.map(parseRow).map(mapEmployee);

    console.log(`Parsed ${employees.length} agents from SQL file`);

    await mongoose.connect(config.databaseUrl || config.mongoUri || process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Clear existing case_manager employees to avoid duplicates on re-runs
    await Employee.deleteMany({ role: 'case_manager' });
    console.log('Cleared existing case_manager employees');

    for (const emp of employees) {
      try {
        await Employee.create(emp);
        console.log(`Imported: ${emp.displayName} (${emp.email})`);
      } catch (err) {
        console.error(`Failed to import ${emp.displayName}: ${err.message}`);
      }
    }

    const count = await Employee.countDocuments({ role: 'case_manager' });
    console.log(`Import complete. Total case_manager employees: ${count}`);
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error.message);
    process.exit(1);
  }
}

importAgents();
