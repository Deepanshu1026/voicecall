require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
const Message = require('../src/models/Message');
const Conversation = require('../src/models/Conversation');

const ATLAS_URI = 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';

async function main() {
  await mongoose.connect(ATLAS_URI);
  console.log('Computing latest messages per conversation...');

  const latest = await Message.aggregate([
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$conversation', lastMessage: { $first: '$_id' } } },
  ]);
  console.log('Found latest messages for', latest.length, 'conversations.');

  const bulkOps = latest.map((item) => ({
    updateOne: {
      filter: { _id: item._id },
      update: { $set: { lastMessage: item.lastMessage } },
    },
  }));

  const BATCH_SIZE = 1000;
  let updated = 0;
  for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
    const batch = bulkOps.slice(i, i + BATCH_SIZE);
    const result = await Conversation.bulkWrite(batch, { ordered: false });
    updated += result.modifiedCount;
    console.log(`Updated batch ${i / BATCH_SIZE + 1}: ${result.modifiedCount} conversations`);
  }

  const totalMessages = await Message.countDocuments();
  console.log(`Updated ${updated} conversations. Total messages now: ${totalMessages}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
