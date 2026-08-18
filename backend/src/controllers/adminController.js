const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/ApiResponse');
const {
  populateConversationParticipants,
  populateMessages,
  populateMessage,
} = require('../utils/populate');

const getAllConversations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, search = '' } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const filter = {};
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    const matchingUsers = await mongoose.model('User').find({
      $or: [{ displayName: searchRegex }, { username: searchRegex }, { email: searchRegex }],
    }).select('_id').lean();
    const matchingEmployees = await mongoose.model('Employee').find({
      $or: [{ displayName: searchRegex }, { username: searchRegex }, { email: searchRegex }],
    }).select('_id').lean();

    const ids = [...matchingUsers, ...matchingEmployees].map((u) => u._id.toString());
    filter.$or = [
      { participants: { $in: ids } },
    ];
  }

  const conversations = await Conversation.find(filter)
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .lean();

  const total = await Conversation.countDocuments(filter);

  const populated = await Promise.all(
    conversations.map((conv) => populateConversationParticipants(conv))
  );

  const enriched = populated.map((conv) => ({
    ...conv,
    participantNames: (conv.participants || []).map((p) => p.displayName || p.username || 'Unknown').join(' ↔ '),
  }));

  ApiResponse.paginated(res, enriched, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total,
    pages: Math.ceil(total / parseInt(limit, 10)),
  });
});

const getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new AppError('Invalid conversation ID', 400);
  }

  const conversation = await Conversation.findById(conversationId).lean();
  if (!conversation) throw new AppError('Conversation not found', 404);

  const messages = await Message.find({ conversation: conversationId })
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .lean();

  const populated = await populateMessages(messages);
  const total = await Message.countDocuments({ conversation: conversationId });

  ApiResponse.paginated(res, populated.reverse(), {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total,
    pages: Math.ceil(total / parseInt(limit, 10)),
  });
});

const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new AppError('Invalid message ID', 400);
  }
  if (!content || typeof content !== 'string') {
    throw new AppError('Content is required', 400);
  }

  const message = await Message.findById(messageId);
  if (!message || message.isDeleted) {
    throw new AppError('Message not found', 404);
  }
  if (message.type !== 'text') {
    throw new AppError('Only text messages can be edited', 400);
  }

  message.content = content;
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  const populated = await populateMessage(message);

  if (req.io) {
    const payload = {
      messageId: message._id,
      content,
      isEdited: true,
      editedAt: message.editedAt,
      conversation: message.conversation.toString(),
    };
    for (const participantId of (message.recipient ? [message.sender, message.recipient] : [message.sender])) {
      if (participantId) {
        req.io.to(`user:${participantId.toString()}`).emit('message:edited', payload);
      }
    }
    req.io.to('admin:room').emit('admin:message:edited', { ...payload, message: populated });
  }

  ApiResponse.success(res, populated, 'Message updated by admin');
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new AppError('Invalid message ID', 400);
  }

  const message = await Message.findById(messageId);
  if (!message) throw new AppError('Message not found', 404);

  message.isDeleted = true;
  message.content = 'This message was deleted';
  await message.save();

  if (req.io) {
    const payload = {
      messageId: message._id,
      forEveryone: true,
      conversation: message.conversation.toString(),
    };
    for (const participantId of (message.recipient ? [message.sender, message.recipient] : [message.sender])) {
      if (participantId) {
        req.io.to(`user:${participantId.toString()}`).emit('message:deleted', payload);
      }
    }
    req.io.to('admin:room').emit('admin:message:deleted', { ...payload, messageId: message._id });
  }

  ApiResponse.success(res, null, 'Message deleted by admin');
});

const getConversationStats = asyncHandler(async (req, res) => {
  const totalConversations = await Conversation.countDocuments();
  const totalMessages = await Message.countDocuments();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMessages = await Message.countDocuments({ createdAt: { $gte: todayStart } });
  const todayConversations = await Conversation.countDocuments({ createdAt: { $gte: todayStart } });

  ApiResponse.success(res, {
    totalConversations,
    totalMessages,
    todayMessages,
    todayConversations,
  }, 'Conversation stats fetched');
});

module.exports = {
  getAllConversations,
  getConversationMessages,
  editMessage,
  deleteMessage,
  getConversationStats,
};
