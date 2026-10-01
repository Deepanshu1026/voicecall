const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ApiKey = require('../models/ApiKey');
const User = require('../models/User');
const Review = require('../models/Review');
const Post = require('../models/Post');
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
const config = require('../config');

// Resolve a stored review image into a browser-loadable URL.
const resolveReviewImage = (value) => {
  if (!value || typeof value !== 'string') return '';
  const v = value.trim().replace(/\\/g, '/');
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith('img/') || v.startsWith('/img/')) {
    return `${config.serverUrl}/images/user/${v.replace(/^\/?img\//, '')}`;
  }
  return v.startsWith('/') ? `${config.serverUrl}${v}` : `${config.serverUrl}/${v}`;
};

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
  message.deletedBy = req.employee?._id || message.deletedBy;
  message.deletedByRole = 'admin';
  message.deletedAt = new Date();
  await message.save();

  if (req.io) {
    const payload = {
      messageId: message._id,
      forEveryone: true,
      isDeleted: true,
      deletedByRole: 'admin',
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
  res.json({
    success: true,
    data: reviews.map((r) => ({ ...r, user_image: resolveReviewImage(r.user_image) })),
  });
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

const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  const { user_name, visa_type, rating, story, user_image } = req.body;
  if (user_name !== undefined) {
    if (!String(user_name).trim()) throw new AppError('Client name is required', 400);
    review.user_name = String(user_name).trim();
  }
  if (story !== undefined) {
    if (!String(story).trim()) throw new AppError('Review text is required', 400);
    review.story = String(story).trim();
  }
  if (visa_type !== undefined) review.visa_type = String(visa_type).trim();
  if (user_image !== undefined) review.user_image = String(user_image).trim();
  if (rating !== undefined) review.rating = Math.min(Math.max(Number(rating) || 5, 1), 5);
  await review.save();
  res.json({ success: true, data: review });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  res.json({ success: true, message: 'Review deleted' });
});

// ==================== BLOG / POSTS ====================

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  if (typeof tags === 'string') return tags.split(',').map((t) => t.trim()).filter(Boolean);
  return [];
};

const uniqueSlug = async (base, excludeId = null) => {
  const root = slugify(base) || 'post';
  let slug = root;
  let n = 2;
  const query = () => (excludeId ? { slug, _id: { $ne: excludeId } } : { slug });
  while (await Post.exists(query())) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
};

const getBlogs = asyncHandler(async (req, res) => {
  const { search = '', status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search && String(search).trim()) {
    const q = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(q, 'i');
    filter.$or = [{ title: rx }, { category: rx }, { slug: rx }];
  }
  const posts = await Post.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: posts });
});

const createBlog = asyncHandler(async (req, res) => {
  const {
    title, slug, excerpt, content, featuredImage, imageAlt, category, tags, author,
    metaTitle, metaDescription, metaKeywords, canonicalUrl, publishedAt, status,
  } = req.body;

  if (!title || !String(title).trim()) throw new AppError('Title is required', 400);
  if (!content || !String(content).trim()) throw new AppError('Content is required', 400);

  const post = await Post.create({
    title: String(title).trim(),
    slug: await uniqueSlug(slug || title),
    excerpt: excerpt ? String(excerpt).trim() : '',
    content: String(content),
    featuredImage: featuredImage ? String(featuredImage).trim() : '',
    imageAlt: imageAlt ? String(imageAlt).trim() : String(title).trim(),
    category: category ? String(category).trim() : 'General',
    tags: parseTags(tags),
    author: author ? String(author).trim() : 'A Visa Experts',
    metaTitle: metaTitle ? String(metaTitle).trim() : '',
    metaDescription: metaDescription ? String(metaDescription).trim() : '',
    metaKeywords: metaKeywords ? String(metaKeywords).trim() : '',
    canonicalUrl: canonicalUrl ? String(canonicalUrl).trim() : '',
    publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
    status: status === 'draft' ? 'draft' : 'published',
    source: 'admin',
  });
  res.status(201).json({ success: true, data: post });
});

const updateBlog = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Blog not found', 404);

  const stringFields = ['title', 'excerpt', 'content', 'featuredImage', 'imageAlt', 'category', 'author', 'metaTitle', 'metaDescription', 'metaKeywords', 'canonicalUrl'];
  stringFields.forEach((f) => {
    if (req.body[f] !== undefined) post[f] = typeof req.body[f] === 'string' ? req.body[f].trim() : req.body[f];
  });
  if (req.body.slug !== undefined) post.slug = await uniqueSlug(req.body.slug || post.title, post._id);
  if (req.body.tags !== undefined) post.tags = parseTags(req.body.tags);
  if (req.body.status !== undefined) post.status = req.body.status === 'draft' ? 'draft' : 'published';
  if (req.body.publishedAt !== undefined) post.publishedAt = req.body.publishedAt ? new Date(req.body.publishedAt) : post.publishedAt;

  await post.save();
  res.json({ success: true, data: post });
});

const deleteBlog = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) throw new AppError('Blog not found', 404);
  res.json({ success: true, message: 'Blog deleted' });
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
  updateReview,
  deleteReview,
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
};
