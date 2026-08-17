require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');

async function main() {
  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.ATLAS_URI;
  if (!MONGO_URI) {
    console.error('No MongoDB URI found. Set MONGODB_URI, MONGO_URI, or ATLAS_URI in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  const oldPath = 'img/userdemo.webp';
  const newPath = '/images/user/userdemo.webp';

  const userRes = await User.updateMany(
    { 'avatar.url': oldPath },
    { $set: { 'avatar.url': newPath, updatedAt: new Date() } }
  );

  console.log(`Updated ${userRes.modifiedCount} users from ${oldPath} to ${newPath}.`);
  console.log(`Matched ${userRes.matchedCount} users.`);

  const empRes = await Employee.updateMany(
    { avatar: oldPath },
    { $set: { avatar: newPath, updatedAt: new Date() } }
  );

  console.log(`Updated ${empRes.modifiedCount} employees from ${oldPath} to ${newPath}.`);
  console.log(`Matched ${empRes.matchedCount} employees.`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Update failed:', err);
  process.exit(1);
});
