const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ApiKey = require('../models/ApiKey');
const User = require('../models/User');
const Review = require('../models/Review');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/ApiResponse');
const {
  populateConversationParticipants,
  populateMessages,
  populateMessage,
} = require('../utils/populate');
const { sendToToken, sendMulticast, sendBroadcast, isConfigured } = require('../services/pushNotificationService');
const FcmToken = require('../models/FcmToken');

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

const getFcmTokens = asyncHandler(async (req, res) => {
  const { userId, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (userId) filter.userId = userId;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const [tokens, total] = await Promise.all([
    FcmToken.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit, 10)).lean(),
    FcmToken.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, tokens, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total,
    pages: Math.ceil(total / parseInt(limit, 10)),
  });
});

const sendManualPush = asyncHandler(async (req, res) => {
  const { title, body, data, imageUrl, token, userId } = req.body;

  if (!title || !body) {
    throw new AppError('Title and body are required', 400);
  }

  if (!token && !userId) {
    throw new AppError('Either token or userId is required', 400);
  }

  if (!isConfigured()) {
    throw new AppError('Firebase Cloud Messaging is not configured. Set FCM_SERVICE_ACCOUNT_PATH or FCM_SERVICE_ACCOUNT_JSON.', 503);
  }

  let result;
  if (token) {
    result = await sendToToken({ token, title, body, data: data || {}, imageUrl });
  } else {
    const tokens = await FcmToken.find({ userId }).select('token').lean();
    if (tokens.length === 0) {
      throw new AppError('No FCM tokens found for this user', 404);
    }
    result = await sendMulticast({
      tokens: tokens.map((t) => t.token),
      title,
      body,
      data: data || {},
      imageUrl,
    });
  }

  if (!result.success) {
    throw new AppError(result.error, 500, { failures: result.failures || [], batchErrors: result.batchErrors || [] });
  }

  ApiResponse.success(res, result, 'Push notification sent');
});

const sendBroadcastPush = asyncHandler(async (req, res) => {
  const { title, body, data, imageUrl } = req.body;

  if (!title || !body) {
    throw new AppError('Title and body are required', 400);
  }

  if (!isConfigured()) {
    throw new AppError('Firebase Cloud Messaging is not configured. Set FCM_SERVICE_ACCOUNT_PATH or FCM_SERVICE_ACCOUNT_JSON.', 503);
  }

  const result = await sendBroadcast({
    title,
    body,
    data: data || {},
    imageUrl,
  });

  if (!result.success) {
    throw new AppError(result.error, 500, { batchErrors: result.batchErrors || [] });
  }

  ApiResponse.success(res, result, 'Broadcast push notification sent');
});

const getInstagramToken = asyncHandler(async (req, res) => {
  const key = await ApiKey.findOne().sort({ createdAt: -1 }).lean();
  ApiResponse.success(res, { token: key?.key || '' });
});

const updateInstagramToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (typeof token !== 'string') {
    throw new AppError('Token must be a string', 400);
  }

  const key = await ApiKey.findOneAndUpdate(
    {},
    { key: token, name: 'Instagram Access Token', updatedAt: new Date() },
    { sort: { createdAt: -1 }, new: true, upsert: true }
  );

  ApiResponse.success(res, { token: key.key }, 'Instagram token updated');
});

const searchUsers = asyncHandler(async (req, res) => {
  const { search = '' } = req.query;
  const q = String(search).trim();
  const filter = {};
  if (q) {
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { displayName: re },
      { username: re },
      { email: re },
      { mobile: re },
    ];
  }
  const users = await User.find(filter)
    .select('displayName username email mobile countryCode role status loginFrom isVerified createdAt')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json({ success: true, data: users });
});

const getUserDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select('+password').lean();
  if (!user) throw new AppError('User not found', 404);
  const { password, ...rest } = user;
  res.json({ success: true, data: { ...rest, passwordSet: !!password } });
});

const resetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password || String(password).length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }
  const user = await User.findById(id).select('+password');
  if (!user) throw new AppError('User not found', 404);
  user.password = String(password);
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: reviews });
});

const createReview = asyncHandler(async (req, res) => {
  const { user_name, visa_type, rating, story, user_image } = req.body;
  if (!user_name || !String(user_name).trim()) {
    throw new AppError('Client name is required', 400);
  }
  if (!story || !String(story).trim()) {
    throw new AppError('Review text is required', 400);
  }
  const review = await Review.create({
    user_name: String(user_name).trim(),
    visa_type: visa_type ? String(visa_type).trim() : '',
    rating: Math.min(Math.max(Number(rating) || 5, 1), 5),
    story: String(story).trim(),
    user_image: user_image ? String(user_image).trim() : '',
    createdAt: new Date(),
  });
  res.status(201).json({ success: true, data: review });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  res.json({ success: true, message: 'Review deleted' });
});

module.exports = {
  getAllConversations,
  getConversationMessages,
  editMessage,
  deleteMessage,
  getConversationStats,
  getFcmTokens,
  sendManualPush,
  sendBroadcastPush,
  getInstagramToken,
  updateInstagramToken,
  searchUsers,
  getUserDetail,
  resetUserPassword,
  getReviews,
  createReview,
  deleteReview,
};
