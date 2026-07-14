const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Call = require('../models/Call');
const config = require('../config');

const onlineUsers = new Map();
const userCallRooms = new Map();
const HEARTBEAT_TIMEOUT_MS = 2 * 60 * 1000;

const markStaleUsersOffline = async () => {
  try {
    const staleThreshold = new Date(Date.now() - HEARTBEAT_TIMEOUT_MS);
    await User.updateMany(
      { status: 'online', lastSeen: { $lt: staleThreshold } },
      { status: 'offline', lastSeen: new Date() }
    );
  } catch (err) {
    console.error('Failed to mark stale users offline:', err);
  }
};

const isUserOnline = (userId) => onlineUsers.has(userId);

const refreshOnlineList = async () => {
  await markStaleUsersOffline();
  const onlineUserIds = await User.find({ status: 'online' }).select('_id').lean();
  return onlineUserIds.map((u) => u._id.toString());
};

const setupSocket = (io) => {
  // Mark users that were online before a server restart as offline
  markStaleUsersOffline();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${socket.user.displayName || socket.user.username} (${userId})`);

    onlineUsers.set(userId, socket.id);

    try {
      await User.findByIdAndUpdate(userId, { status: 'online', lastSeen: new Date() });
    } catch (err) {
      console.error('Failed to update user status:', err);
    }

    socket.join(`user:${userId}`);
    socket.broadcast.emit('user:status', { userId, status: 'online' });

    refreshOnlineList().then((onlineList) => {
      io.emit('online:users', onlineList);
    });

    socket.emit('connected', { userId, message: 'Connected to server' });

    socket.on('heartbeat', async () => {
      try {
        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
      } catch (err) {
        console.error('Heartbeat update error:', err);
      }
    });

    socket.on('user:getStatus', async ({ userId: targetId }) => {
      try {
        const user = await User.findById(targetId).select('status lastSeen').lean();
        if (!user) {
          socket.emit('user:status', { userId: targetId, status: 'offline' });
          return;
        }
        const isRecentlyActive =
          user.status === 'online' && new Date() - new Date(user.lastSeen) < HEARTBEAT_TIMEOUT_MS;
        const status = isRecentlyActive || onlineUsers.has(targetId) ? 'online' : 'offline';
        socket.emit('user:status', {
          userId: targetId,
          status,
          lastSeen: user.lastSeen,
        });
      } catch {
        socket.emit('user:status', { userId: targetId, status: 'offline' });
      }
    });

    socket.on('typing:start', ({ conversationId, recipientId }) => {
      socket.to(`user:${recipientId}`).emit('typing:start', {
        conversationId,
        userId,
      });
    });

    socket.on('typing:stop', ({ conversationId, recipientId }) => {
      socket.to(`user:${recipientId}`).emit('typing:stop', {
        conversationId,
        userId,
      });
    });

    socket.on('message:send', async (data, callback) => {
      try {
        const { conversationId, content, type = 'text', replyTo, fileName, fileSize, fileUrl, mimeType } = data;

        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (!conversation) {
          if (callback) callback({ error: 'Conversation not found' });
          return;
        }

        const recipient = conversation.participants.find((p) => p.toString() !== userId);

        const recipientUser = await User.findById(recipient);
        if (recipientUser && recipientUser.blockedUsers.includes(userId)) {
          if (callback) callback({ error: 'Cannot send message to this user' });
          return;
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          recipient,
          type: fileUrl ? 'file' : type,
          content: content || '',
          replyTo: replyTo || null,
          fileName,
          fileSize,
          fileUrl,
          mimeType,
          status: 'sent',
          'statusTimestamps.sent': new Date(),
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

        io.to(`user:${recipient}`).emit('message:new', message);
        io.to(`user:${userId}`).emit('message:new', message);

        if (callback) callback({ success: true, message });
      } catch (error) {
        console.error('Socket message send error:', error);
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('message:delivered', async ({ messageIds }) => {
      try {
        await Message.updateMany(
          { _id: { $in: messageIds }, recipient: userId, status: 'sent' },
          { $addToSet: { deliveredTo: userId }, status: 'delivered', 'statusTimestamps.delivered': new Date() }
        );

        const messages = await Message.find({ _id: { $in: messageIds } })
          .populate('sender', 'username displayName avatar');

        messages.forEach((msg) => {
          const senderId = msg.sender._id.toString();
          io.to(`user:${senderId}`).emit('message:status', {
            messageId: msg._id,
            status: 'delivered',
          });
        });
      } catch (error) {
        console.error('Delivered update error:', error);
      }
    });

    socket.on('message:seen', async ({ conversationId }) => {
      try {
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: userId }, readBy: { $ne: userId }, isDeleted: false },
          { $addToSet: { readBy: userId }, status: 'seen', 'statusTimestamps.seen': new Date() }
        );

        const convo = await Conversation.findOne({ _id: conversationId, participants: userId });
        if (convo) {
          const unreadEntry = convo.unreadCount.find((u) => u.user.toString() === userId);
          if (unreadEntry) unreadEntry.count = 0;
          await convo.save();
        }

        io.to(`user:${userId}`).emit('messages:read', { conversationId });

        const otherParticipant = await Conversation.findById(conversationId).populate('participants');
        if (otherParticipant) {
          const other = otherParticipant.participants.find((p) => p._id.toString() !== userId);
          if (other) {
            io.to(`user:${other._id}`).emit('messages:read', { conversationId });
          }
        }
      } catch (error) {
        console.error('Seen update error:', error);
      }
    });

    socket.on('message:edit', async ({ messageId, content }) => {
      try {
        const message = await Message.findOne({ _id: messageId, sender: userId, isDeleted: false });
        if (!message) return;

        message.content = content;
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        if (message.recipient) {
          io.to(`user:${message.recipient}`).emit('message:edited', {
            messageId,
            content,
            isEdited: true,
            editedAt: message.editedAt,
          });
        }

        socket.emit('message:edited', {
          messageId,
          content,
          isEdited: true,
          editedAt: message.editedAt,
        });
      } catch (error) {
        console.error('Edit message error:', error);
      }
    });

    socket.on('message:delete', async ({ messageId, deleteForEveryone }) => {
      try {
        const message = await Message.findOne({ _id: messageId, sender: userId });
        if (!message) {
          const msg = await Message.findById(messageId);
          if (!msg) return;
          msg.deletedFor.push(userId);
          await msg.save();
          socket.emit('message:deleted', { messageId, forEveryone: false });
          return;
        }

        if (deleteForEveryone) {
          message.isDeleted = true;
          message.content = 'This message was deleted';
        } else {
          message.deletedFor.push(userId);
        }

        await message.save();

        if (deleteForEveryone && message.recipient) {
          io.to(`user:${message.recipient}`).emit('message:deleted', {
            messageId,
            forEveryone: true,
          });
        }

        socket.emit('message:deleted', { messageId, forEveryone: deleteForEveryone });
      } catch (error) {
        console.error('Delete message error:', error);
      }
    });

    socket.on('message:reaction', async ({ messageId, emoji }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.isDeleted) return;

        const existingReaction = message.reactions.find(
          (r) => r.user.toString() === userId
        );

        if (existingReaction) {
          existingReaction.emoji = emoji;
          existingReaction.createdAt = new Date();
        } else {
          message.reactions.push({ user: userId, emoji });
        }

        await message.save();
        await message.populate('reactions.user', 'username displayName avatar');

        io.to(`user:${message.recipient}`).emit('message:reaction:updated', {
          messageId,
          reactions: message.reactions,
        });
        socket.emit('message:reaction:updated', {
          messageId,
          reactions: message.reactions,
        });
      } catch (error) {
        console.error('Reaction error:', error);
      }
    });

    socket.on('message:reaction:remove', async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message || message.isDeleted) return;

        message.reactions = message.reactions.filter(
          (r) => r.user.toString() !== userId
        );
        await message.save();

        if (message.recipient) {
          io.to(`user:${message.recipient}`).emit('message:reaction:updated', {
            messageId,
            reactions: message.reactions,
          });
        }
        socket.emit('message:reaction:updated', {
          messageId,
          reactions: message.reactions,
        });
      } catch (error) {
        console.error('Remove reaction error:', error);
      }
    });

    // ==================== WebRTC Signaling ====================

    socket.on('call:initiate', async ({ receiverId, type = 'audio', callId }) => {
      try {
        const receiverSocketId = onlineUsers.get(receiverId);
        const callerUser = await User.findById(userId).select('username displayName avatar');

        if (!receiverSocketId) {
          socket.emit('call:error', { message: 'User is offline', receiverId });
          return;
        }

        const receiverUser = await User.findById(receiverId);
        if (receiverUser && receiverUser.blockedUsers.includes(userId)) {
          socket.emit('call:error', { message: 'Cannot call this user', receiverId });
          return;
        }

        const call = await Call.create({
          caller: userId,
          receiver: receiverId,
          type: type || 'audio',
          status: 'ringing',
        });

        await call.populate('caller', 'username displayName avatar');
        await call.populate('receiver', 'username displayName avatar');

        const roomId = `call:${call._id}`;
        socket.join(roomId);
        userCallRooms.set(userId, roomId);

        io.to(receiverSocketId).emit('call:incoming', {
          call: call.toObject(),
          caller: callerUser,
          roomId,
        });

        socket.emit('call:ringing', { call: call.toObject(), roomId });
      } catch (error) {
        console.error('Call initiate error:', error);
        socket.emit('call:error', { message: 'Failed to initiate call' });
      }
    });

    socket.on('call:accept', async ({ callId, roomId }) => {
      try {
        socket.join(roomId);
        userCallRooms.set(userId, roomId);

        await Call.findByIdAndUpdate(callId, {
          status: 'ongoing',
          startedAt: new Date(),
        });

        const call = await Call.findById(callId)
          .populate('caller', 'username displayName avatar')
          .populate('receiver', 'username displayName avatar');

        io.to(roomId).emit('call:accepted', { call: call.toObject(), roomId });
      } catch (error) {
        console.error('Call accept error:', error);
        socket.emit('call:error', { message: 'Failed to accept call' });
      }
    });

    socket.on('call:reject', async ({ callId }) => {
      try {
        await Call.findByIdAndUpdate(callId, { status: 'rejected', endedAt: new Date() });

        const call = await Call.findById(callId)
          .populate('caller', 'username displayName avatar')
          .populate('receiver', 'username displayName avatar');

        const otherUserId = call.caller._id.toString() === userId
          ? call.receiver._id.toString()
          : call.caller._id.toString();

        io.to(`user:${otherUserId}`).emit('call:rejected', { call: call.toObject() });
      } catch (error) {
        console.error('Call reject error:', error);
      }
    });

    socket.on('call:end', async ({ callId, duration }) => {
      try {
        await Call.findByIdAndUpdate(callId, {
          status: 'ended',
          duration: duration || 0,
          endedAt: new Date(),
        });

        const call = await Call.findById(callId)
          .populate('caller', 'username displayName avatar')
          .populate('receiver', 'username displayName avatar');

        const roomId = `call:${callId}`;
        io.to(roomId).emit('call:ended', { call: call.toObject() });

        const socketsInRoom = await io.in(roomId).fetchSockets();
        socketsInRoom.forEach((s) => s.leave(roomId));
        userCallRooms.delete(call.caller._id.toString());
        userCallRooms.delete(call.receiver._id.toString());
      } catch (error) {
        console.error('Call end error:', error);
      }
    });

    socket.on('call:signal', ({ callId, signal }) => {
      socket.to(`call:${callId}`).emit('call:signal', { callId, signal, from: userId });
    });

    socket.on('call:missed', async ({ callId }) => {
      try {
        await Call.findByIdAndUpdate(callId, { status: 'missed', endedAt: new Date() });

        const call = await Call.findById(callId)
          .populate('caller', 'username displayName avatar')
          .populate('receiver', 'username displayName avatar');

        io.to(`user:${call.receiver._id}`).emit('call:missed', { call: call.toObject() });

        let conversation = await Conversation.findOne({
          type: 'direct',
          participants: { $all: [call.caller, call.receiver], $size: 2 },
        });

        if (!conversation) {
          conversation = await Conversation.create({
            type: 'direct',
            participants: [call.caller, call.receiver],
          });
        }

        const systemMsg = await Message.create({
          conversation: conversation._id,
          sender: call.caller,
          recipient: call.receiver,
          type: 'system',
          isSystemMessage: true,
          content: 'Missed voice call',
          callReference: call._id,
        });

        conversation.lastMessage = systemMsg._id;
        await conversation.save();

        io.to(`user:${call.receiver._id}`).emit('message:new', systemMsg);
        io.to(`user:${call.caller._id}`).emit('message:new', systemMsg);
      } catch (error) {
        console.error('Missed call error:', error);
      }
    });

    // ==================== Disconnect ====================

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      onlineUsers.delete(userId);

      try {
        await User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: new Date() });
      } catch (err) {
        console.error('Failed to update offline status:', err);
      }

      socket.broadcast.emit('user:status', { userId, status: 'offline', lastSeen: new Date() });

      refreshOnlineList().then((onlineList) => {
        io.emit('online:users', onlineList);
      });
    });
  });
};

module.exports = setupSocket;
