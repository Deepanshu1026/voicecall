const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);

const URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';

(async () => {
  await mongoose.connect(URI);
  const db = mongoose.connection.db;

  // All employee ObjectIds
  const employees = await db.collection('employees').find({}).toArray();
  console.log('Employees with conversations:');
  
  for (const emp of employees) {
    const count = await db.collection('conversations').countDocuments({ participants: emp._id });
    const msgCount = count > 0 ? await db.collection('messages').countDocuments({ conversation: { $in: (await db.collection('conversations').find({ participants: emp._id }).project({ _id: 1 }).toArray()).map(c => c._id) } }) : 0;
    console.log(`  ${emp.displayName || emp.username} (${emp.email || 'no email'}): ${count} conversations, ${msgCount} messages`);
  }

  await mongoose.disconnect();
  process.exit(0);
})().catch(e => console.error(e));
