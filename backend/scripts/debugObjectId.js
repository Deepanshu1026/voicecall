require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);

const ATLAS_URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';

(async () => {
  await mongoose.connect(ATLAS_URI);
  const db = mongoose.connection.db;

  const emp = await db.collection('employees').findOne({ email: 'bhumirajj.07@gmail.com' });
  if (emp) {
    console.log('_id type:', typeof emp._id);
    console.log('_id constructor:', emp._id.constructor.name);
    console.log('_id value:', JSON.stringify(emp._id));
    console.log('_id string:', emp._id.toString());
    console.log('Matches 6a5f38ac4dac303757990b4e:', emp._id.toString() === '6a5f38ac4dac303757990b4e');
  } else {
    console.log('Employee not found by email');
  }

  // Try finding by ObjectId
  const oid = new mongoose.Types.ObjectId('6a5f38ac4dac303757990b4e');
  const byOid = await db.collection('employees').findOne({ _id: oid });
  console.log('By ObjectId:', byOid ? 'FOUND' : 'NOT FOUND');

  await mongoose.disconnect();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
