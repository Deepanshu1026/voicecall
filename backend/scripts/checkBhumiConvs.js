const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);

const URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';

(async () => {
  await mongoose.connect(URI);
  const db = mongoose.connection.db;

  // Find Bhumi's employee record
  const bhumi = await db.collection('employees').findOne({ email: 'bhumirajj.07@gmail.com' });
  if (!bhumi) { console.log('Bhumi not found'); process.exit(0); }
  
  console.log('Bhumi _id:', bhumi._id.toString(), 'sqlId:', bhumi.sqlId);

  // Find conversations where Bhumi is a participant
  const bhumiConvs = await db.collection('conversations').find({
    participants: bhumi._id
  }).toArray();
  
  console.log(`\nConversations with Bhumi: ${bhumiConvs.length}`);
  if (bhumiConvs.length > 0) {
    // Show first 3
    bhumiConvs.slice(0, 3).forEach(c => {
      console.log(`  Conv: ${c._id}, participants: ${c.participants.map(p => p.toString()).join(', ')}`);
    });
    
    // Count messages in Bhumi's conversations
    const convIds = bhumiConvs.map(c => c._id);
    const msgCount = await db.collection('messages').countDocuments({ conversation: { $in: convIds } });
    console.log(`Total messages in Bhumi's conversations: ${msgCount}`);
    
    // Show first 5 messages
    const msgs = await db.collection('messages').find({ conversation: { $in: convIds } })
      .sort({ createdAt: -1 }).limit(5).toArray();
    msgs.forEach(m => {
      console.log(`  Msg: ${m._id}, content: ${(m.content || '').substring(0, 50)}, conv: ${m.conversation}`);
    });
  } else {
    // Check if Bhumi's sqlId is 3369 — find conversations by looking at which employee has sqlId 3369's conversations
    console.log('\nNo conversations found for Bhumi. Checking if she has conversations via sqlId...');
    const allConvs = await db.collection('conversations').find({}).limit(5).toArray();
    allConvs.forEach(c => {
      console.log(`Conv ${c._id}: participants = ${JSON.stringify(c.participants)}`);
    });
  }

  await mongoose.disconnect();
  process.exit(0);
})().catch(e => console.error(e));
