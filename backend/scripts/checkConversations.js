const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);

const URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';

(async () => {
  await mongoose.connect(URI);
  const db = mongoose.connection.db;
  
  const convs = await db.collection('conversations').find({}).limit(5).toArray();
  console.log('Sample conversations:');
  convs.forEach(c => {
    console.log(`  _id: ${c._id}`);
    console.log(`  participants: ${c.participants?.length}`);
    console.log(`  lockedToAgent: ${c.lockedToAgent}`);
    console.log(`  freeUntil: ${c.freeUntil}`);
    console.log(`  isPaid: ${c.isPaid}`);
    console.log('---');
  });
  
  // Count conversations with freeUntil
  const withFreeUntil = await db.collection('conversations').countDocuments({ freeUntil: { $exists: true, $ne: null } });
  const withLockedAgent = await db.collection('conversations').countDocuments({ lockedToAgent: { $exists: true, $ne: null } });
  console.log(`\n${withFreeUntil} conversations have freeUntil`);
  console.log(`${withLockedAgent} conversations have lockedToAgent`);
  
  await mongoose.disconnect();
  process.exit(0);
})().catch(e => console.error(e));
