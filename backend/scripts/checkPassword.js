require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
dns.setServers(['8.8.8.8']);

const ATLAS_URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';

(async () => {
  await mongoose.connect(ATLAS_URI);
  const emp = await mongoose.connection.db.collection('employees').findOne({ email: 'bhumirajj.07@gmail.com' });
  if (emp) {
    console.log('Employee found:', emp.email, 'has password:', !!emp.password);
    const match = await bcrypt.compare('123456', emp.password);
    console.log('Password 123456 matches:', match);
  } else {
    console.log('Employee not found');
  }
  await mongoose.disconnect();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
