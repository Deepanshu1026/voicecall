const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Call = require('../models/Call');
const config = require('../config');

const onlineUserSockets = new Map(); // userId -> Set of socket ids
const pendingOfflineTimeouts = new Map(); // userId -> timeout id
const userCallRooms = new Map();
const HEARTBEAT_TIMEOUT_MS = 2 * 60 * 1000;
const OFFLINE_GRACE_PERIOD_MS = 5000; // small delay to avoid flicker during reconnect

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

const scheduleUserOffline = (io, userId) => {
  if (pendingOfflineTimeouts.has(userId)) return;
  const timeout = setTimeout(async () => {
    pendingOfflineTimeouts.delete(userId);
    if (onlineUserSockets.has(userId) && onlineUserSockets.get(userId).size > 0) return;

    onlineUserSockets.delete(userId);
    try {
      await User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: new Date() });
    } catch (err) {
      console.error('Failed to update offline status:', err);
    }
    io.emit('user:status', { userId, status: 'offline', lastSeen: new Date() });
    refreshOnlineList().then((onlineList) => {
      io.emit('online:users', onlineList);
    });
  }, OFFLINE_GRACE_PERIOD_MS);
  pendingOfflineTimeouts.set(userId, timeout);
};

const cancelUserOffline = (userId) => {
  const timeout = pendingOfflineTimeouts.get(userId);
  if (timeout) {
    clearTimeout(timeout);
    pendingOfflineTimeouts.delete(userId);
  }
};

const markUserOnline = async (io, userId) => {
  cancelUserOffline(userId);
  try {
    await User.findByIdAndUpdate(userId, { status: 'online', lastSeen: new Date() });
  } catch (err) {
    console.error('Failed to update user status:', err);
  }
  io.emit('user:status', { userId, status: 'online', lastSeen: new Date() });
  refreshOnlineList().then((onlineList) => {
    io.emit('online:users', onlineList);
  });
};

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

    const userSocketSet = onlineUserSockets.get(userId) || new Set();
    const wasOnline = userSocketSet.size > 0;
    userSocketSet.add(socket.id);
    onlineUserSockets.set(userId, userSocketSet);

    socket.join(`user:${userId}`);
    socket.emit('connected', { userId, message: 'Connected to server' });

    // Only broadcast online status if this is the first active socket for the user
    if (!wasOnline) {
      markUserOnline(io, userId);
    } else {
      // Still refresh the list for this socket so it has the latest state
      refreshOnlineList().then((onlineList) => {
        socket.emit('online:users', onlineList);
      });
    }

    socket.on('heartbeat', async () => {
      try {
        await User.findByIdAndUpdate(userId, { status: 'online', lastSeen: new Date() });
      } catch (err) {
        console.error('Heartbeat update error:', err);
      }
    });

    socket.on('user:getOnline', async () => {
      try {
        const onlineList = await refreshOnlineList();
        socket.emit('online:users', onlineList);
      } catch (err) {
        console.error('Get online users error:', err);
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
        const hasActiveSocket = onlineUserSockets.has(targetId) && onlineUserSockets.get(targetId).size > 0;
        const status = isRecentlyActive || hasActiveSocket ? 'online' : 'offline';
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

    // ==================== Helpers ====================

    const getCall = async (callId) => {
      return Call.findById(callId)
        .populate('caller', 'username displayName avatar')
        .populate('receiver', 'username displayName avatar');
    };

    const isParticipant = (call, uid) => {
      const callerId = call.caller._id?.toString() || call.caller.toString();
      const receiverId = call.receiver._id?.toString() || call.receiver.toString();
      return callerId === uid || receiverId === uid;
    };

    const isUserBusy = (uid) => {
      return userCallRooms.has(uid);
    };

    const isUserOnlineDB = async (uid) => {
      const user = await User.findById(uid).select('status lastSeen').lean();
      if (!user || user.status !== 'online') return false;
      return Date.now() - new Date(user.lastSeen).getTime() < HEARTBEAT_TIMEOUT_MS;
    };

    const endCallRoom = async (roomId, status, duration = 0) => {
      const callId = roomId.replace('call:', '');
      try {
        const call = await Call.findByIdAndUpdate(
          callId,
          { status, duration, endedAt: new Date() },
          { new: true }
        )
          .populate('caller', 'username displayName avatar')
          .populate('receiver', 'username displayName avatar');
        if (call) {
          io.to(roomId).emit('call:ended', { call: call.toObject() });
          const socketsInRoom = await io.in(roomId).fetchSockets();
          socketsInRoom.forEach((s) => s.leave(roomId));
          userCallRooms.delete(call.caller._id.toString());
          userCallRooms.delete(call.receiver._id.toString());
        }
      } catch (err) {
        console.error('End call room error:', err);
      }
    };

    // ==================== WebRTC Signaling ====================

    socket.on('call:initiate', async ({ receiverId, type = 'audio', offer }) => {
      try {
        if (!receiverId || receiverId === userId) {
          socket.emit('call:error', { message: 'Invalid receiver' });
          return;
        }

        if (!offer || !offer.sdp || !offer.type) {
          socket.emit('call:error', { message: 'Missing call offer' });
          return;
        }

        if (isUserBusy(userId)) {
          socket.emit('call:error', { message: 'You are already in a call' });
          return;
        }

        const receiverOnline = await isUserOnlineDB(receiverId);
        if (!receiverOnline) {
          socket.emit('call:error', { message: 'User is offline', receiverId });
          return;
        }

        const [receiverUser, callerUser] = await Promise.all([
          User.findById(receiverId).select('blockedUsers'),
          User.findById(userId).select('username displayName avatar blockedUsers'),
        ]);

        if (!receiverUser) {
          socket.emit('call:error', { message: 'Receiver not found', receiverId });
          return;
        }

        if (receiverUser.blockedUsers.includes(userId) || callerUser.blockedUsers.includes(receiverId)) {
          socket.emit('call:error', { message: 'Cannot call this user', receiverId });
          return;
        }

        if (isUserBusy(receiverId)) {
          socket.emit('call:error', { message: 'User is busy', receiverId });
          return;
        }

        const call = await Call.create({
          caller: userId,
          receiver: receiverId,
          type: type || 'audio',
          status: 'ringing',
          signalData: { offer: { type: offer.type, sdp: offer.sdp } },
        });

        await call.populate('caller', 'username displayName avatar');
        await call.populate('receiver', 'username displayName avatar');

        const roomId = `call:${call._id}`;
        socket.join(roomId);
        userCallRooms.set(userId, roomId);

        io.to(`user:${receiverId}`).emit('call:incoming', {
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
        if (isUserBusy(userId)) {
          socket.emit('call:error', { message: 'You are already in a call' });
          return;
        }

        const call = await getCall(callId);
        if (!call) {
          socket.emit('call:error', { message: 'Call not found' });
          return;
        }
        if (!isParticipant(call, userId)) {
          socket.emit('call:error', { message: 'Not authorized' });
          return;
        }
        if (call.status !== 'ringing') {
          socket.emit('call:error', { message: 'Call is no longer ringing' });
          return;
        }

        socket.join(roomId);
        userCallRooms.set(userId, roomId);

        await Call.findByIdAndUpdate(callId, {
          status: 'ongoing',
          startedAt: new Date(),
        });

        const updatedCall = await getCall(callId);
        io.to(roomId).emit('call:accepted', { call: updatedCall.toObject(), roomId });

        // Send the caller's offer to the receiver so they can create an answer
        if (call.signalData?.offer) {
          socket.emit('call:signal', {
            callId,
            signal: { sdp: { type: call.signalData.offer.type, sdp: call.signalData.offer.sdp } },
            from: call.caller._id.toString(),
          });
        }
      } catch (error) {
        console.error('Call accept error:', error);
        socket.emit('call:error', { message: 'Failed to accept call' });
      }
    });

    socket.on('call:reject', async ({ callId }) => {
      try {
        const call = await getCall(callId);
        if (!call || !isParticipant(call, userId)) return;
        if (!['ringing', 'ongoing'].includes(call.status)) return;

        await Call.findByIdAndUpdate(callId, { status: 'rejected', endedAt: new Date() });

        const otherUserId = call.caller._id.toString() === userId
          ? call.receiver._id.toString()
          : call.caller._id.toString();

        io.to(`user:${otherUserId}`).emit('call:rejected', { call: call.toObject() });
        userCallRooms.delete(userId);
        userCallRooms.delete(otherUserId);
      } catch (error) {
        console.error('Call reject error:', error);
      }
    });

    socket.on('call:end', async ({ callId, duration }) => {
      try {
        const call = await getCall(callId);
        if (!call || !isParticipant(call, userId)) return;
        if (['ended', 'rejected', 'missed'].includes(call.status)) return;

        await Call.findByIdAndUpdate(callId, {
          status: 'ended',
          duration: duration || 0,
          endedAt: new Date(),
        });

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

    socket.on('call:signal', async ({ callId, signal }) => {
      try {
        const call = await getCall(callId);
        if (!call || !isParticipant(call, userId)) return;
        if (!['ringing', 'ongoing'].includes(call.status)) return;

        const roomId = `call:${callId}`;
        socket.to(roomId).emit('call:signal', { callId, signal, from: userId });
      } catch (error) {
        console.error('Call signal error:', error);
      }
    });

    socket.on('call:missed', async ({ callId }) => {
      try {
        const call = await getCall(callId);
        if (!call || !isParticipant(call, userId)) return;
        if (call.status !== 'ringing') return;

        await Call.findByIdAndUpdate(callId, { status: 'missed', endedAt: new Date() });

        const roomId = `call:${callId}`;
        const updatedCall = await getCall(callId);
        io.to(roomId).emit('call:missed', { call: updatedCall.toObject() });

        let conversation = await Conversation.findOne({
          type: 'direct',
          participants: { $all: [call.caller._id, call.receiver._id], $size: 2 },
        });

        if (!conversation) {
          conversation = await Conversation.create({
            type: 'direct',
            participants: [call.caller._id, call.receiver._id],
          });
        }

        const systemMsg = await Message.create({
          conversation: conversation._id,
          sender: call.caller._id,
          recipient: call.receiver._id,
          type: 'system',
          isSystemMessage: true,
          content: 'Missed voice call',
          callReference: call._id,
          status: 'delivered',
        });

        conversation.lastMessage = systemMsg._id;
        await conversation.save();

        io.to(`user:${call.receiver._id}`).emit('message:new', systemMsg);
        io.to(`user:${call.caller._id}`).emit('message:new', systemMsg);

        userCallRooms.delete(call.caller._id.toString());
        userCallRooms.delete(call.receiver._id.toString());
      } catch (error) {
        console.error('Missed call error:', error);
      }
    });

    // ==================== Disconnect ====================

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId} socket ${socket.id}`);

      const userSocketSet = onlineUserSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          onlineUserSockets.delete(userId);
          scheduleUserOffline(io, userId);
        }
      }

      // Only end the call room if this socket was the one participating in the call
      const roomId = userCallRooms.get(userId);
      if (roomId) {
        const stillInRoom = await io.in(roomId).fetchSockets();
        const userStillInRoom = stillInRoom.some((s) => s.userId === userId);
        if (!userStillInRoom) {
          await endCallRoom(roomId, 'ended');
        }
      }
    });
  });
};

module.exports = setupSocket;
