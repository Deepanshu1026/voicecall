require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
const URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';
(async () => {
  await mongoose.connect(URI);
  const db = mongoose.connection.db;
  // Check if sqlId 3362 exists in users or employees
  for (const col of ['users', 'employees']) {
    const doc = await db.collection(col).findOne({ sqlId: 3362 });
    if (doc) console.log('Found 3362 in', col, ':', doc.email || doc.username || 'no email');
    const count = await db.collection(col).countDocuments({ sqlId: 3362 });
    if (count > 0) console.log(col, 'has', count, 'docs with sqlId=3362');
  }
  // Check all sqlId 550 references
  for (const col of ['users', 'employees']) {
    const doc = await db.collection(col).findOne({ sqlId: 550 });
    if (doc) console.log('Found 550 in', col, ':', doc.email || doc.username || 'no email');
  }
  // Messages with Bhumi
  const bhumi = await db.collection('employees').findOne({ email: 'bhumirajj.07@gmail.com' });
  if (bhumi) {
    const msgs = await db.collection('messages').find({ $or: [{ sender: bhumi._id }, { recipient: bhumi._id }] }).count();
    console.log('Messages with Bhumi:', msgs);
    // Show distinct other participants
    const convs = await db.collection('conversations').find({ participants: bhumi._id }).toArray();
    console.log('Bhumi conversations:', convs.length);
    for (const c of convs) {
      const other = c.participants.find(p => p.toString() !== bhumi._id.toString());
      const user = await db.collection('users').findOne({ _id: other });
      const emp = await db.collection('employees').findOne({ _id: other });
      const name = (user?.displayName || user?.username || emp?.displayName || emp?.username || 'unknown').toString();
      const msgCount = await db.collection('messages').countDocuments({ conversation: c._id });
      console.log('  Conv with', name, '-', msgCount, 'messages');
    }
  }
  await mongoose.disconnect();
  process.exit(0);
})().catch(e => console.error(e));
