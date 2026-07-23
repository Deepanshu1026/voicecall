require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8']);

const ATLAS_URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';

(async () => {
  await mongoose.connect(ATLAS_URI);
  console.log('Connected to Atlas');

  // Fix employee passwords
  const hash = await bcrypt.hash('123456', 12);
  const empResult = await mongoose.connection.db.collection('employees').updateMany(
    {},
    { $set: { password: hash } }
  );
  console.log(`Employees updated: ${empResult.modifiedCount}`);

  // Also fix a known user password (Deepanshu -> test1234)
  const userHash = await bcrypt.hash('test1234', 12);
  const userResult = await mongoose.connection.db.collection('users').updateMany(
    { email: 'bishtdepanshu321@gmail.com' },
    { $set: { password: userHash } }
  );
  console.log(`User Deepanshu updated: ${userResult.modifiedCount}`);

  // Set a catch-all password for any users that might need it
  const catchAllHash = await bcrypt.hash('123456', 12);
  const userAllResult = await mongoose.connection.db.collection('users').updateMany(
    {},
    { $set: { password: catchAllHash } }
  );
  console.log(`All users password reset: ${userAllResult.modifiedCount}`);

  await mongoose.disconnect();
  console.log('Done!');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
