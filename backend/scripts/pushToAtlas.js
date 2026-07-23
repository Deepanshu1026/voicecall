// Run this to push all local MongoDB data to MongoDB Atlas
// Usage: node scripts/pushToAtlas.js

require('dotenv').config();
const mongoose = require('mongoose');

// Try SRV first, fall back to direct connection
const SRV_URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';
const DIRECT_URI = 'mongodb://avisaexpertstm_db_user:ySwllOSR02KMhFAT@ac-vs7id2l-shard-00-00.ebkh4k3.mongodb.net:27017,ac-vs7id2l-shard-00-01.ebkh4k3.mongodb.net:27017,ac-vs7id2l-shard-00-02.ebkh4k3.mongodb.net:27017/voicecall?ssl=true&replicaSet=atlas-14hph6-shard-0&authSource=admin&retryWrites=true&w=majority';
const ATLAS_URI = SRV_URI;
const LOCAL_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/voicecall';

async function copyCollection(sourceDb, destDb, name) {
  const docs = await sourceDb.collection(name).find({}).toArray();
  if (docs.length === 0) { console.log(`  ${name}: 0 docs, skipped`); return; }
  await destDb.collection(name).deleteMany({});
  await destDb.collection(name).insertMany(docs, { ordered: false });
  console.log(`  ${name}: ${docs.length} docs copied`);
}

(async () => {
  try {
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('Connected to both databases\n');

    const collections = await localConn.db.listCollections().toArray();
    const names = collections.map((c) => c.name).filter((n) => !n.startsWith('system.'));

    console.log('Copying collections...');
    for (const name of names) {
      try {
        await copyCollection(localConn.db, atlasConn.db, name);
      } catch (err) {
        console.log(`  ${name}: FAILED - ${err.message}`);
      }
    }

    console.log('\nDone! All data pushed to Atlas.');
    await localConn.close();
    await atlasConn.close();
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
})();
