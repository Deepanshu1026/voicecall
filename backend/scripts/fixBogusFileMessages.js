require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../src/config');
const Message = require('../src/models/Message');
const Conversation = require('../src/models/Conversation');

const isValidFileUrl = (url) => typeof url === 'string' && (url.startsWith('http') || url.startsWith('/uploads/'));

(async () => {
  await mongoose.connect(config.mongodbUri || process.env.MONGODB_URI);
  console.log('Connected to DB');

  // Find all file/image messages with invalid fileUrl or bogus fileName
  const bogusFilePatterns = ['NULL', 'null', 'N/A', 'undefined'];
  const query = {
    type: { $in: ['file', 'image'] },
    $or: [
      { fileUrl: { $exists: false } },
      { fileUrl: null },
      { fileUrl: '' },
      { fileUrl: { $not: /^(http|\/uploads\/)/ } },
      { fileName: { $in: bogusFilePatterns } },
    ],
  };

  const messages = await Message.find(query).lean();
  console.log(`Found ${messages.length} bogus file/image messages to fix`);

  if (messages.length === 0) {
    await mongoose.disconnect();
    process.exit(0);
  }

  const messageIds = messages.map((m) => m._id);

  await Message.updateMany(
    { _id: { $in: messageIds } },
    {
      $set: { type: 'text' },
      $unset: { fileUrl: '', fileName: '', fileSize: '', filePublicId: '', mimeType: '', thumbnailUrl: '' },
    }
  );

  console.log(`Updated ${messages.length} messages to type: text`);

  // Recompute lastMessage for affected conversations
  const affectedConversationIds = [...new Set(messages.map((m) => m.conversation.toString()))];
  let updatedConversations = 0;
  for (const convId of affectedConversationIds) {
    const last = await Message.findOne({ conversation: convId }).sort({ createdAt: -1 }).select('_id').lean();
    if (last) {
      await Conversation.updateOne({ _id: convId }, { lastMessage: last._id });
      updatedConversations++;
    }
  }
  console.log(`Updated lastMessage for ${updatedConversations} conversations`);

  await mongoose.disconnect();
  console.log('Done');
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
