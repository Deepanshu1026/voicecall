const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Transaction = require('../models/Transaction');
const config = require('../config');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');
const { getAccountById, getAccountDocumentById } = require('../utils/account');
const {
  populateConversationParticipants,
  populateMessages,
  populateMessage,
  populateMessageSender,
} = require('../utils/populate');

const EMPLOYEE_ROLES = ['case_manager', 'manager', 'senior_manager', 'admin'];
const isAgentRole = (role) => role === 'agent' || EMPLOYEE_ROLES.includes(role);

const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { participantId } = req.body;

  if (!participantId) throw new AppError('Participant ID is required', 400);
  if (participantId === req.userId.toString()) throw new AppError('Cannot create conversation with yourself', 400);

  const participant = await getAccountById(participantId, 'role blockedUsers callRate');
  if (!participant) throw new AppError('User not found', 404);

  const callerBlocked = (req.user.blockedUsers || []).map((id) => id.toString());
  const participantBlocked = (participant.blockedUsers || []).map((id) => id.toString());
  const blocked = callerBlocked.includes(participantId) || participantBlocked.includes(req.userId.toString());
  if (blocked) throw new AppError('Cannot create conversation with blocked user', 403);

  const isUserToAgent = req.user.role === 'user' && isAgentRole(participant.role);

  let conversation = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [req.userId, participantId], $size: 2 },
  });

    if (!conversation) {
      const conversationData = {
        type: 'direct',
        participants: [req.userId, participantId],
      };

      if (isUserToAgent) {
        conversationData.freeUntil = new Date(Date.now() + config.freeChatDurationSeconds * 1000);
        conversationData.isPaid = false;
        conversationData.paymentAmount = config.chatPaymentAmount;
        conversationData.lockedToAgent = participantId;
      }

      conversation = await Conversation.create(conversationData);
    }

  // If an existing conversation is user-to-agent but not locked, convert it into a consultation
  if (conversation && isUserToAgent && !conversation.lockedToAgent) {
    conversation.lockedToAgent = participantId;
    conversation.freeUntil = new Date(Date.now() + config.freeChatDurationSeconds * 1000);
    conversation.isPaid = false;
    conversation.paymentAmount = config.chatPaymentAmount;
    await conversation.save();
  }

  const convObj = await populateConversationParticipants(conversation);

  const unreadEntry = convObj.unreadCount.find((u) => u.user.toString() === req.userId.toString());
  const unreadCount = unreadEntry ? unreadEntry.count : 0;

  ApiResponse.success(res, { ...convObj, unreadCount }, 'Conversation ready', conversation.isNew ? 201 : 200);
});

const getConversations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const conversations = await Conversation.find({
    participants: req.userId,
    isActive: true,
  })
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Conversation.countDocuments({
    participants: req.userId,
    isActive: true,
  });

  const populatedConversations = await Promise.all(
    conversations.map((conv) => populateConversationParticipants(conv))
  );

  const enrichedConversations = populatedConversations.map((conv) => {
    const unreadEntry = conv.unreadCount.find((u) => u.user.toString() === req.userId.toString());
    const otherParticipant = conv.participants.find((p) => p._id.toString() !== req.userId.toString());
    return {
      ...conv,
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
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  const populatedMessages = await populateMessages(messages);

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

  ApiResponse.paginated(res, populatedMessages.reverse(), {
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

  const recipientAccount = await getAccountById(recipient, 'blockedUsers');
  if (recipientAccount && (recipientAccount.blockedUsers || []).map((id) => id.toString()).includes(req.userId.toString())) {
    throw new AppError('Cannot send message to this user', 403);
  }

  // Free/paid consultation check for user -> agent conversations
  if (
    conversation.lockedToAgent &&
    conversation.lockedToAgent.toString() === recipient.toString() &&
    req.userId.toString() !== conversation.lockedToAgent.toString()
  ) {
    const now = new Date();
    if (conversation.freeUntil && now > conversation.freeUntil && !conversation.isPaid) {
      throw new AppError(
        'Free chat has ended. Please pay to continue chatting.',
        402,
        { paymentAmount: conversation.paymentAmount }
      );
    }
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

  await message.populate('replyTo');
  const populatedMessage = await populateMessageSender(message);

  const existingUnread = conversation.unreadCount.find((u) => u.user.toString() === recipient.toString());
  if (existingUnread) {
    existingUnread.count += 1;
  } else {
    conversation.unreadCount.push({ user: recipient, count: 1 });
  }
  conversation.lastMessage = message._id;
  await conversation.save();

  if (req.io) {
    req.io.to(`user:${recipient}`).emit('message:new', populatedMessage);
    req.io.to(`user:${req.userId}`).emit('message:new', populatedMessage);
  }

  ApiResponse.success(res, populatedMessage, 'Message sent', 201);
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

  if (req.io && message.recipient) {
    req.io.to(`user:${message.recipient.toString()}`).emit('message:edited', {
      messageId: message._id,
      content,
      isEdited: true,
      editedAt: message.editedAt,
      conversation: message.conversation.toString(),
    });
  }

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

  if (req.io && deleteForEveryone && message.recipient) {
    req.io.to(`user:${message.recipient.toString()}`).emit('message:deleted', {
      messageId: message._id,
      forEveryone: true,
      conversation: message.conversation.toString(),
    });
  }

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

    const populatedForwardedMsg = await populateMessageSender(forwardedMsg);
    forwardedMessages.push(populatedForwardedMsg);
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
  const populatedMessage = await populateMessage(message);

  if (req.io && message.recipient) {
    req.io.to(`user:${message.recipient.toString()}`).emit('message:reaction:updated', {
      messageId: message._id,
      reactions: populatedMessage.reactions,
      conversation: message.conversation.toString(),
    });
  }

  ApiResponse.success(res, populatedMessage.reactions, 'Reaction updated');
});

const removeReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message || message.isDeleted) throw new AppError('Message not found', 404);

  message.reactions = message.reactions.filter(
    (r) => r.user.toString() !== req.userId.toString()
  );
  await message.save();

  if (req.io && message.recipient) {
    req.io.to(`user:${message.recipient.toString()}`).emit('message:reaction:updated', {
      messageId: message._id,
      reactions: message.reactions,
      conversation: message.conversation.toString(),
    });
  }

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

  if (req.io) {
    const messages = await Message.find({ _id: { $in: messageIds } });
    messages.forEach((msg) => {
      req.io.to(`user:${msg.sender.toString()}`).emit('message:status', {
        messageId: msg._id,
        status: 'delivered',
        conversation: msg.conversation.toString(),
      });
    });
  }

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

    if (req.io) {
      const otherParticipantId = conversation.participants.find((p) => p.toString() !== req.userId.toString());
      if (otherParticipantId) {
        req.io.to(`user:${otherParticipantId.toString()}`).emit('messages:read', { conversationId });
      }
    }
  }

  ApiResponse.success(res, null, 'Conversation marked as read');
});

const payForConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  let conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.userId,
  });

  if (!conversation) throw new AppError('Conversation not found', 404);

  let convObj = await populateConversationParticipants(conversation, '-password');

  if (conversation.isPaid) {
    const otherParticipant = convObj.participants.find(
      (p) => p._id.toString() !== req.userId.toString()
    );
    return ApiResponse.success(res, {
      ...convObj,
      otherParticipant,
      walletBalance: req.user?.walletBalance,
    }, 'Conversation already paid');
  }

  const amount = conversation.paymentAmount || 0;
  const userResult = await getAccountDocumentById(req.userId, 'walletBalance');

  if (!userResult) throw new AppError('User not found', 404);
  const { account: user } = userResult;
  const balance = user.walletBalance || 0;
  if (balance < amount) {
    throw new AppError(
      'Insufficient wallet balance. Please add money to your wallet.',
      402,
      { balance, requiredAmount: amount }
    );
  }

  // Deduct from wallet and mark conversation as paid
  user.walletBalance -= amount;
  await user.save();

  await Transaction.create({
    user: req.userId,
    amount,
    type: 'debit',
    description: 'Consultation payment',
    status: 'completed',
    conversation: conversation._id,
  });

  conversation.isPaid = true;
  conversation.freeUntil = null;
  await conversation.save();

  // Re-populate to return full participant data to the frontend
  convObj = await populateConversationParticipants(conversation, '-password');

  const otherParticipant = convObj.participants.find(
    (p) => p._id.toString() !== req.userId.toString()
  );

  ApiResponse.success(res, {
    ...convObj,
    otherParticipant,
    walletBalance: user.walletBalance,
  }, 'Payment successful. You can now continue chatting.');
});

const resetConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.userId,
    lockedToAgent: { $ne: null },
  });

  if (!conversation) throw new AppError('Consultation not found', 404);

  const isCaller = conversation.participants.some(
    (p) => p.toString() === req.userId.toString() && p.toString() !== conversation.lockedToAgent.toString()
  );

  if (!isCaller) throw new AppError('Only the caller can reset this consultation', 403);

  conversation.isPaid = false;
  conversation.freeUntil = new Date(Date.now() + config.freeChatDurationSeconds * 1000);
  await conversation.save();

  const convObj = await populateConversationParticipants(conversation);

  const otherParticipant = convObj.participants.find(
    (p) => p._id.toString() !== req.userId.toString()
  );

  ApiResponse.success(res, { ...convObj, otherParticipant }, 'Consultation reset to free chat');
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
  payForConversation,
  resetConversation,
};
