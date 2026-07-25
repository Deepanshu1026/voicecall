const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);

const URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';

(async () => {
  await mongoose.connect(URI);
  const db = mongoose.connection.db;
  
  // Find messages with fileUrl set
  const withFile = await db.collection('messages').find({ fileUrl: { $exists: true, $ne: null } }).limit(5).toArray();
  
  if (withFile.length === 0) {
    console.log('No messages with fileUrl found');
    const anyFile = await db.collection('messages').find({ $or: [{ type: 'file' }, { type: 'image' }] }).limit(5).toArray();
    console.log(`\nMessages with type='file' or 'image': ${anyFile.length}`);
    anyFile.forEach(m => {
      console.log(`  _id: ${m._id}, type: ${m.type}, fileName: ${m.fileName}, fileUrl: ${m.fileUrl}`);
    });
  } else {
    withFile.forEach(m => {
      console.log(`  _id: ${m._id}, type: ${m.type}, fileName: ${m.fileName}, fileUrl: ${m.fileUrl}`);
    });
  }
  
  await mongoose.disconnect();
  process.exit(0);
})().catch(e => console.error(e));
