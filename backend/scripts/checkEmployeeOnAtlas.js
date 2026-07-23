require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);

const ATLAS_URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';

(async () => {
  await mongoose.connect(ATLAS_URI);
  const emp = await mongoose.connection.db.collection('employees').findOne({ _id: new mongoose.Types.ObjectId('6a5f38ac4dac303757990b4e') });
  console.log('By _id:', emp ? emp.email : 'NOT FOUND');
  const byEmail = await mongoose.connection.db.collection('employees').findOne({ email: 'bhumirajj.07@gmail.com' });
  console.log('By email:', byEmail ? byEmail._id.toString() + ' exists' : 'NOT FOUND');
  await mongoose.disconnect();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
