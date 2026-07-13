const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');

const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { participantId } = req.body;

  if (!participantId) throw new AppError('Participant ID is required', 400);
  if (participantId === req.userId.toString()) throw new AppError('Cannot create conversation with yourself', 400);

  const participant = await User.findById(participantId);
  if (!participant) throw new AppError('User not found', 404);

  const blocked = req.user.blockedUsers.includes(participantId) || participant.blockedUsers.includes(req.userId);
  if (blocked) throw new AppError('Cannot create conversation with blocked user', 403);

  let conversation = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [req.userId, participantId], $size: 2 },
  }).populate('participants', 'username displayName avatar status lastSeen');

  if (!conversation) {
    conversation = await Conversation.create({
      type: 'direct',
      participants: [req.userId, participantId],
    });
    conversation = await conversation.populate('participants', 'username displayName avatar status lastSeen');
  }

  const unreadEntry = conversation.unreadCount.find((u) => u.user.toString() === req.userId.toString());
  const unreadCount = unreadEntry ? unreadEntry.count : 0;

  ApiResponse.success(res, { ...conversation.toObject(), unreadCount }, 'Conversation ready', conversation.isNew ? 201 : 200);
});

const getConversations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const conversations = await Conversation.find({
    participants: req.userId,
    isActive: true,
  })
    .populate('participants', 'username displayName avatar status lastSeen')
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Conversation.countDocuments({
    participants: req.userId,
    isActive: true,
  });

  const enrichedConversations = conversations.map((conv) => {
    const unreadEntry = conv.unreadCount.find((u) => u.user.toString() === req.userId.toString());
    const otherParticipant = conv.participants.find((p) => p._id.toString() !== req.userId.toString());
    return {
      ...conv.toObject(),
      otherParticipant,
      unreadCount: unreadEntry ? unreadEntry.count : 0,
    };
  });

  ApiResponse.paginated(res, enrichedConversations, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
  });
});

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50, before } = req.query;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.userId,
  });

  if (!conversation) throw new AppError('Conversation not found', 404);

  const query = {
    conversation: conversationId,
    isDeleted: false,
  };

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const messages = await Message.find(query)
    .populate('sender', 'username displayName avatar')
    .populate('replyTo')
    .populate('reactions.user', 'username displayName avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  const unreadMessages = await Message.find({
    conversation: conversationId,
    sender: { $ne: req.userId },
    readBy: { $ne: req.userId },
    isDeleted: false,
  });

  if (unreadMessages.length > 0) {
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.userId },
        readBy: { $ne: req.userId },
      },
      {
        $addToSet: { readBy: req.userId },
        status: 'seen',
        'statusTimestamps.seen': new Date(),
      }
    );
  }

  const unreadEntry = conversation.unreadCount.find((u) => u.user.toString() === req.userId.toString());
  if (unreadEntry) unreadEntry.count = 0;
  await conversation.save();

  const total = await Message.countDocuments(query);

  ApiResponse.paginated(res, messages.reverse(), {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
  });
});

const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content, type = 'text', replyTo, fileName, fileSize, mimeType } = req.body;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.userId,
  });

  if (!conversation) throw new AppError('Conversation not found', 404);

  const recipient = conversation.participants.find(
    (p) => p.toString() !== req.userId.toString()
  );

  const recipientUser = await User.findById(recipient);
  if (recipientUser && recipientUser.blockedUsers.includes(req.userId)) {
    throw new AppError('Cannot send message to this user', 403);
  }

  let fileData = {};
  if (req.file) {
    fileData = {
      fileName: req.file.originalname || fileName,
      fileSize: req.file.size || fileSize,
      fileUrl: `/uploads/files/${req.file.filename}`,
      filePublicId: req.file.filename,
      mimeType: req.file.mimetype || mimeType,
    };
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: req.userId,
    recipient,
    type: req.file ? 'file' : type,
    content: content || '',
    replyTo: replyTo || null,
    status: 'sent',
    'statusTimestamps.sent': new Date(),
    ...fileData,
    $addToSet: { deliveredTo: recipient },
  });

  await message.populate('sender', 'username displayName avatar');
  await message.populate('replyTo');

  const existingUnread = conversation.unreadCount.find((u) => u.user.toString() === recipient.toString());
  if (existingUnread) {
    existingUnread.count += 1;
  } else {
    conversation.unreadCount.push({ user: recipient, count: 1 });
  }
  conversation.lastMessage = message._id;
  await conversation.save();

  ApiResponse.success(res, message, 'Message sent', 201);
});

const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  const message = await Message.findOne({
    _id: messageId,
    sender: req.userId,
    isDeleted: false,
  });

  if (!message) throw new AppError('Message not found or not authorized', 404);
  if (message.type !== 'text') throw new AppError('Only text messages can be edited', 400);

  message.content = content;
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  ApiResponse.success(res, message, 'Message edited');
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { deleteForEveryone } = req.body;

  const message = await Message.findOne({
    _id: messageId,
    sender: req.userId,
  });

  if (!message) {
    const msg = await Message.findById(messageId);
    if (!msg) throw new AppError('Message not found', 404);
    msg.deletedFor.push(req.userId);
    await msg.save();
    return ApiResponse.success(res, null, 'Message deleted for you');
  }

  if (deleteForEveryone) {
    message.isDeleted = true;
    message.content = 'This message was deleted';
  } else {
    message.deletedFor.push(req.userId);
  }

  await message.save();
  ApiResponse.success(res, null, 'Message deleted');
});

const forwardMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { targetConversationIds } = req.body;

  if (!targetConversationIds || !Array.isArray(targetConversationIds)) {
    throw new AppError('Target conversation IDs are required', 400);
  }

  const originalMessage = await Message.findById(messageId);
  if (!originalMessage || originalMessage.isDeleted) {
    throw new AppError('Message not found', 404);
  }

  const forwardedMessages = [];
  for (const targetConvId of targetConversationIds) {
    const targetConv = await Conversation.findOne({
      _id: targetConvId,
      participants: req.userId,
    });
    if (!targetConv) continue;

    const recipient = targetConv.participants.find((p) => p.toString() !== req.userId.toString());

    const forwardedMsg = await Message.create({
      conversation: targetConvId,
      sender: req.userId,
      recipient,
      type: originalMessage.type,
      content: originalMessage.content,
      fileName: originalMessage.fileName,
      fileSize: originalMessage.fileSize,
      fileUrl: originalMessage.fileUrl,
      filePublicId: originalMessage.filePublicId,
      mimeType: originalMessage.mimeType,
      forwardedFrom: originalMessage.sender,
      forwardCount: originalMessage.forwardCount + 1,
      status: 'sent',
      'statusTimestamps.sent': new Date(),
    });

    await forwardedMsg.populate('sender', 'username displayName avatar');
    forwardedMessages.push(forwardedMsg);
  }

  originalMessage.forwardCount = (originalMessage.forwardCount || 0) + 1;
  await originalMessage.save();

  ApiResponse.success(res, forwardedMessages, `Message forwarded to ${forwardedMessages.length} conversations`, 201);
});

const addReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;

  if (!emoji) throw new AppError('Emoji is required', 400);

  const message = await Message.findById(messageId);
  if (!message || message.isDeleted) throw new AppError('Message not found', 404);

  const existingReaction = message.reactions.find(
    (r) => r.user.toString() === req.userId.toString()
  );

  if (existingReaction) {
    existingReaction.emoji = emoji;
    existingReaction.createdAt = new Date();
  } else {
    message.reactions.push({ user: req.userId, emoji });
  }

  await message.save();
  await message.populate('reactions.user', 'username displayName avatar');

  ApiResponse.success(res, message.reactions, 'Reaction updated');
});

const removeReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message || message.isDeleted) throw new AppError('Message not found', 404);

  message.reactions = message.reactions.filter(
    (r) => r.user.toString() !== req.userId.toString()
  );
  await message.save();

  ApiResponse.success(res, message.reactions, 'Reaction removed');
});

const markAsDelivered = asyncHandler(async (req, res) => {
  const { messageIds } = req.body;

  if (!messageIds || !Array.isArray(messageIds)) {
    throw new AppError('Message IDs are required', 400);
  }

  await Message.updateMany(
    {
      _id: { $in: messageIds },
      recipient: req.userId,
      status: 'sent',
    },
    {
      $addToSet: { deliveredTo: req.userId },
      status: 'delivered',
      'statusTimestamps.delivered': new Date(),
    }
  );

  ApiResponse.success(res, null, 'Messages marked as delivered');
});

const markConversationRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  await Message.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: req.userId },
      readBy: { $ne: req.userId },
      isDeleted: false,
    },
    {
      $addToSet: { readBy: req.userId },
      status: 'seen',
      'statusTimestamps.seen': new Date(),
    }
  );

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.userId,
  });

  if (conversation) {
    const unreadEntry = conversation.unreadCount.find((u) => u.user.toString() === req.userId.toString());
    if (unreadEntry) unreadEntry.count = 0;
    await conversation.save();
  }

  ApiResponse.success(res, null, 'Conversation marked as read');
});

module.exports = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  forwardMessage,
  addReaction,
  removeReaction,
  markAsDelivered,
  markConversationRead,
};
