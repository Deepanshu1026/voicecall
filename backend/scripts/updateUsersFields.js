require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../src/models/User');

const sql = fs.readFileSync(path.resolve(__dirname, '..', '..', 'users (1).sql'), 'utf8');
const regex = new RegExp(
  `INSERT\\s+INTO\\s+\\\`?users\\\`?\\s*\\(([^)]+)\\)\\s*VALUES\\s*((?:\\([^)]+\\)\\s*,?\\s*)+)`, 'gi'
);
const matches = [...sql.matchAll(regex)];
const headers = matches[0][1].split(',').map((h) => h.trim().replace(/`/g, ''));
const rows = [];
for (const m of matches) {
  const vms = [...m[2].matchAll(/\(([^)]*)\)/g)];
  for (const vm of vms) {
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

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voicecall');
  console.log(`Parsed ${rows.length} users from SQL`);

  let updated = 0;
  for (const su of rows) {
    const email = (su.user_email || '').trim().toLowerCase();
    if (!email) continue;
    const update = {};
    if (su.country_code || su.country_code === 0) update.countryCode = String(su.country_code);
    if (su.user_mobile) update.mobile = String(su.user_mobile).trim();
    if (su.login_from) update.loginFrom = su.login_from;

    const res = await User.updateOne({ email }, { $set: update });
    if (res.modifiedCount > 0) updated++;
  }

  console.log(`Updated ${updated} users with countryCode/mobile/loginFrom`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
