require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);

const ATLAS_URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';

(async () => {
  await mongoose.connect(ATLAS_URI);
  const db = mongoose.connection.db;

  // Fix _id fields that are stored as {$oid: '...'} instead of ObjectIds
  const collections = ['users', 'employees', 'messages', 'conversations', 'applications', 'applicationlogs', 'calls', 'transactions'];

  for (const name of collections) {
    const docs = await db.collection(name).find({}).toArray();
    let fixed = 0;
    for (const doc of docs) {
      if (doc._id && typeof doc._id === 'object' && doc._id.$oid) {
        await db.collection(name).updateOne(
          { _id: doc._id },
          { $set: { _id: new mongoose.Types.ObjectId(doc._id.$oid) } }
        );
        fixed++;
      }
    }
    console.log(`${name}: fixed ${fixed} documents`);
  }

  await mongoose.disconnect();
  console.log('Done!');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
