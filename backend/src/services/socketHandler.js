const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Call = require('../models/Call');
const callBilling = require('./callBillingService');
const config = require('../config');
const { getAccountById } = require('../utils/account');
const { populateMessage, populateCall } = require('../utils/populate');

const onlineUserSockets = new Map(); // userId -> Set of socket ids
const onlineEmployeeSockets = new Map(); // employeeId -> Set of socket ids
const pendingOfflineTimeouts = new Map(); // userId -> timeout id
const pendingEmployeeOfflineTimeouts = new Map(); // employeeId -> timeout id
const userCallRooms = new Map();
const callSignalBuffers = new Map(); // callId -> [{ signal, fromSocketId }]
const callDisconnectTimeouts = new Map(); // roomId -> timeout id
const callParticipantsCache = new Map(); // callId -> { callerId, receiverId }
const HEARTBEAT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes to survive background-tab throttling
const OFFLINE_GRACE_PERIOD_MS = 1000; // 1 second DB grace period; status is broadcast instantly
const STALE_CLEANUP_INTERVAL_MS = 60 * 1000; // run stale cleanup once a minute
const CALL_DISCONNECT_GRACE_PERIOD_MS = 30 * 1000; // wait 30s before ending a call on socket disconnect

const markStaleUsersOffline = async () => {
  try {
    const staleThreshold = new Date(Date.now() - HEARTBEAT_TIMEOUT_MS);
    const inCallUserIds = Array.from(userCallRooms.keys());
    const result = await User.updateMany(
      {
        status: 'online',
        lastSeen: { $lt: staleThreshold },
        _id: { $nin: inCallUserIds },
      },
      { status: 'offline', lastSeen: new Date() }
    );
    if (result.modifiedCount > 0) {
      console.log(`Marked ${result.modifiedCount} stale user(s) offline`);
    }
  } catch (err) {
    console.error('Failed to mark stale users offline:', err);
  }
};

const markStaleEmployeesOffline = async () => {
  try {
    const staleThreshold = new Date(Date.now() - HEARTBEAT_TIMEOUT_MS);
    const inCallUserIds = Array.from(userCallRooms.keys());
    const result = await Employee.updateMany(
      {
        workStatus: 'active',
        lastSeen: { $lt: staleThreshold },
        _id: { $nin: inCallUserIds },
      },
      { workStatus: 'unavailable', lastSeen: new Date() }
    );
    if (result.modifiedCount > 0) {
      console.log(`Marked ${result.modifiedCount} stale employee(s) offline`);
    }
  } catch (err) {
    console.error('Failed to mark stale employees offline:', err);
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
    io.emit('online:users', refreshOnlineList());
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

const scheduleEmployeeOffline = (io, employeeId) => {
  if (pendingEmployeeOfflineTimeouts.has(employeeId)) return;
  const timeout = setTimeout(async () => {
    pendingEmployeeOfflineTimeouts.delete(employeeId);
    if (onlineEmployeeSockets.has(employeeId) && onlineEmployeeSockets.get(employeeId).size > 0) return;

    onlineEmployeeSockets.delete(employeeId);
    try {
      await Employee.findByIdAndUpdate(employeeId, { workStatus: 'unavailable', lastSeen: new Date() });
    } catch (err) {
      console.error('Failed to update employee offline status:', err);
    }
    io.emit('user:status', { userId: employeeId, status: 'offline', lastSeen: new Date() });
    io.emit('online:users', refreshOnlineList());
  }, OFFLINE_GRACE_PERIOD_MS);
  pendingEmployeeOfflineTimeouts.set(employeeId, timeout);
};

const cancelEmployeeOffline = (employeeId) => {
  const timeout = pendingEmployeeOfflineTimeouts.get(employeeId);
  if (timeout) {
    clearTimeout(timeout);
    pendingEmployeeOfflineTimeouts.delete(employeeId);
  }
};

const markEmployeeOnline = async (io, employeeId) => {
  cancelEmployeeOffline(employeeId);
  try {
    await Employee.findByIdAndUpdate(employeeId, { workStatus: 'active', lastSeen: new Date() });
  } catch (err) {
    console.error('Failed to update employee status:', err);
  }
  io.emit('user:status', { userId: employeeId, status: 'online', lastSeen: new Date() });
  io.emit('online:users', refreshOnlineList());
};

const markUserOnline = async (io, userId) => {
  cancelUserOffline(userId);
  try {
    await User.findByIdAndUpdate(userId, { status: 'online', lastSeen: new Date() });
  } catch (err) {
    console.error('Failed to update user status:', err);
  }
  io.emit('user:status', { userId, status: 'online', lastSeen: new Date() });
  io.emit('online:users', refreshOnlineList());
};

const refreshOnlineList = () => {
  // Real-time online list built from active socket sets (fast, no DB query)
  const userIds = Array.from(onlineUserSockets.keys()).filter((id) => onlineUserSockets.get(id)?.size > 0);
  const employeeIds = Array.from(onlineEmployeeSockets.keys()).filter((id) => onlineEmployeeSockets.get(id)?.size > 0);
  return [...userIds, ...employeeIds];
};

const startStaleCleanup = (io) => {
  return setInterval(async () => {
    await markStaleUsersOffline();
    await markStaleEmployeesOffline();
    io.emit('online:users', refreshOnlineList());
  }, STALE_CLEANUP_INTERVAL_MS);
};

// ==================== Call Signal Buffer ====================
// Ensures WebRTC signals are not lost when the other peer has not yet joined the room.

const bufferCallSignal = (callId, signal, fromSocketId) => {
  if (!callSignalBuffers.has(callId)) {
    callSignalBuffers.set(callId, []);
  }
  callSignalBuffers.get(callId).push({ signal, fromSocketId });
};

const flushCallSignalBuffer = async (io, roomId) => {
  const callId = roomId.replace('call:', '');
  const buffer = callSignalBuffers.get(callId);
  if (!buffer || buffer.length === 0) return;

  const sockets = await io.in(roomId).fetchSockets();
  const delivered = [];

  buffer.forEach(({ signal, fromSocketId }) => {
    const otherSocket = sockets.find((s) => s.id !== fromSocketId);
    if (otherSocket) {
      otherSocket.emit('call:signal', signal);
      delivered.push({ signal, fromSocketId });
    }
  });

  const remaining = buffer.filter((item) => !delivered.includes(item));
  if (remaining.length === 0) {
    callSignalBuffers.delete(callId);
  } else {
    callSignalBuffers.set(callId, remaining);
  }
};

const forwardOrBufferCallSignal = async (io, roomId, fromSocketId, signal) => {
  const sockets = await io.in(roomId).fetchSockets();
  const otherSocket = sockets.find((s) => s.id !== fromSocketId);

  if (otherSocket) {
    otherSocket.emit('call:signal', signal);
    return true;
  }

  const callId = roomId.replace('call:', '');
  bufferCallSignal(callId, signal, fromSocketId);
  return false;
};

const clearCallSignalBuffer = (callId) => {
  callSignalBuffers.delete(callId);
};

const setCallParticipants = (callId, callerId, receiverId) => {
  callParticipantsCache.set(callId, { callerId, receiverId });
};

const getCallParticipants = (callId) => {
  return callParticipantsCache.get(callId);
};

const clearCallParticipants = (callId) => {
  callParticipantsCache.delete(callId);
};

const isCallParticipant = (callId, userId) => {
  const participants = callParticipantsCache.get(callId);
  if (!participants) return false;
  return participants.callerId === userId || participants.receiverId === userId;
};

const setupSocket = (io) => {
  // Mark users that were online before a server restart as offline
  markStaleUsersOffline();
  const staleCleanupInterval = startStaleCleanup(io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        socket.isGuest = true;
        return next();
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      let account = await User.findById(decoded.id);
      if (account) {
        socket.userId = account._id.toString();
        socket.user = account;
        socket.isEmployee = false;
        socket.isGuest = false;
        return next();
      }

      account = await Employee.findById(decoded.id);
      if (account) {
        socket.userId = account._id.toString();
        socket.employee = account;
        socket.isEmployee = true;
        socket.isGuest = false;
        return next();
      }

      return next(new Error('Account not found'));
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    if (socket.isGuest) {
      console.log(`Guest connected: ${socket.id}`);
      try {
        socket.emit('online:users', refreshOnlineList());
      } catch (err) {
        console.error('Failed to send online list to guest:', err);
      }

      socket.on('user:getOnline', async () => {
        try {
          socket.emit('online:users', refreshOnlineList());
        } catch (err) {
          console.error('Guest get online users error:', err);
        }
      });

      socket.on('user:getStatus', async ({ userId: targetId }) => {
        try {
          const hasActiveSocket =
            (onlineUserSockets.has(targetId) && onlineUserSockets.get(targetId).size > 0) ||
            (onlineEmployeeSockets.has(targetId) && onlineEmployeeSockets.get(targetId).size > 0);
          if (hasActiveSocket) {
            socket.emit('user:status', { userId: targetId, status: 'online', lastSeen: new Date() });
            return;
          }

          const user = await User.findById(targetId).select('status lastSeen').lean();
          if (user) {
            const isRecentlyActive =
              user.status === 'online' && new Date() - new Date(user.lastSeen) < HEARTBEAT_TIMEOUT_MS;
            const status = isRecentlyActive ? 'online' : 'offline';
            socket.emit('user:status', { userId: targetId, status, lastSeen: user.lastSeen });
            return;
          }

          const employee = await Employee.findById(targetId).select('workStatus lastSeen').lean();
          if (employee) {
            const isRecentlyActive =
              employee.workStatus === 'active' && new Date() - new Date(employee.lastSeen) < HEARTBEAT_TIMEOUT_MS;
            const status = isRecentlyActive ? 'online' : 'offline';
            socket.emit('user:status', { userId: targetId, status, lastSeen: employee.lastSeen });
            return;
          }

          socket.emit('user:status', { userId: targetId, status: 'offline' });
        } catch {
          socket.emit('user:status', { userId: targetId, status: 'offline' });
        }
      });

      return;
    }

    const userId = socket.userId;

    if (socket.isEmployee) {
      console.log(`Employee connected: ${socket.employee.displayName || socket.employee.username} (${userId})`);
      const employeeSocketSet = onlineEmployeeSockets.get(userId) || new Set();
      const wasOnline = employeeSocketSet.size > 0;
      employeeSocketSet.add(socket.id);
      onlineEmployeeSockets.set(userId, employeeSocketSet);

      socket.join(`user:${userId}`);
      socket.emit('connected', { userId, message: 'Connected to server' });

      if (!wasOnline) {
        markEmployeeOnline(io, userId);
      } else {
        socket.emit('online:users', refreshOnlineList());
      }
    } else {
      console.log(`User connected: ${socket.user.displayName || socket.user.username} (${userId})`);
      const userSocketSet = onlineUserSockets.get(userId) || new Set();
      const wasOnline = userSocketSet.size > 0;
      userSocketSet.add(socket.id);
      onlineUserSockets.set(userId, userSocketSet);

      socket.join(`user:${userId}`);
      socket.emit('connected', { userId, message: 'Connected to server' });

      // If the user was in a call that is waiting for them to reconnect, rejoin them
      const pendingCallRoomId = userCallRooms.get(userId);
      if (pendingCallRoomId && callDisconnectTimeouts.has(pendingCallRoomId)) {
        console.log(`[Call] ${userId} reconnected, rejoining call room ${pendingCallRoomId}`);
        clearTimeout(callDisconnectTimeouts.get(pendingCallRoomId));
        callDisconnectTimeouts.delete(pendingCallRoomId);
        socket.join(pendingCallRoomId);
        // Flush any buffered signals that arrived while disconnected
        await flushCallSignalBuffer(io, pendingCallRoomId);
      }

      if (!wasOnline) {
        markUserOnline(io, userId);
      } else {
        socket.emit('online:users', refreshOnlineList());
      }
    }

    socket.on('heartbeat', async () => {
      if (socket.isGuest) return;
      try {
        if (socket.isEmployee) {
          await Employee.findByIdAndUpdate(userId, { workStatus: 'active', lastSeen: new Date() });
        } else {
          await User.findByIdAndUpdate(userId, { status: 'online', lastSeen: new Date() });
        }
        // Broadcast status so clients that saw the user as stale-offline are corrected
        io.emit('user:status', { userId, status: 'online', lastSeen: new Date() });
      } catch (err) {
        console.error('Heartbeat update error:', err);
      }
    });

    socket.on('user:getOnline', async () => {
      try {
        socket.emit('online:users', refreshOnlineList());
      } catch (err) {
        console.error('Get online users error:', err);
      }
    });

    socket.on('user:getStatus', async ({ userId: targetId }) => {
      try {
        const hasActiveSocket =
          (onlineUserSockets.has(targetId) && onlineUserSockets.get(targetId).size > 0) ||
          (onlineEmployeeSockets.has(targetId) && onlineEmployeeSockets.get(targetId).size > 0);
        if (hasActiveSocket) {
          socket.emit('user:status', { userId: targetId, status: 'online', lastSeen: new Date() });
          return;
        }

        const user = await User.findById(targetId).select('status lastSeen').lean();
        if (user) {
          const isRecentlyActive =
            user.status === 'online' && new Date() - new Date(user.lastSeen) < HEARTBEAT_TIMEOUT_MS;
          const status = isRecentlyActive ? 'online' : 'offline';
          socket.emit('user:status', { userId: targetId, status, lastSeen: user.lastSeen });
          return;
        }

        const employee = await Employee.findById(targetId).select('workStatus lastSeen').lean();
        if (employee) {
          const isRecentlyActive =
            employee.workStatus === 'active' && new Date() - new Date(employee.lastSeen) < HEARTBEAT_TIMEOUT_MS;
          const status = isRecentlyActive ? 'online' : 'offline';
          socket.emit('user:status', { userId: targetId, status, lastSeen: employee.lastSeen });
          return;
        }

        socket.emit('user:status', { userId: targetId, status: 'offline' });
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

        const recipientAccount = await getAccountById(recipient, 'blockedUsers');
        if (recipientAccount && (recipientAccount.blockedUsers || []).map((id) => id.toString()).includes(userId)) {
          if (callback) callback({ error: 'Cannot send message to this user' });
          return;
        }

        // Free/paid consultation check for user -> agent conversations
        if (
          conversation.lockedToAgent &&
          conversation.lockedToAgent.toString() === recipient.toString() &&
          userId.toString() !== conversation.lockedToAgent.toString()
        ) {
          const now = new Date();
          if (conversation.freeUntil && now > conversation.freeUntil && !conversation.isPaid) {
            if (callback) {
              callback({
                error: 'Free chat has ended. Please pay to continue chatting.',
                paymentRequired: true,
                paymentAmount: conversation.paymentAmount,
              });
            }
            return;
          }
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

        await message.populate('replyTo');
        const populatedSender = await getAccountById(userId, 'username displayName avatar');
        const messageObj = message.toObject();
        if (populatedSender) {
          messageObj.sender = { ...populatedSender, _id: userId };
        }

        const existingUnread = conversation.unreadCount.find((u) => u.user.toString() === recipient.toString());
        if (existingUnread) {
          existingUnread.count += 1;
        } else {
          conversation.unreadCount.push({ user: recipient, count: 1 });
        }
        conversation.lastMessage = message._id;
        await conversation.save();

        io.to(`user:${recipient}`).emit('message:new', messageObj);
        io.to(`user:${userId}`).emit('message:new', messageObj);

        if (callback) callback({ success: true, message: messageObj });
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

        const messages = await Message.find({ _id: { $in: messageIds } });

        messages.forEach((msg) => {
          const senderId = msg.sender.toString();
          io.to(`user:${senderId}`).emit('message:status', {
            messageId: msg._id,
            status: 'delivered',
            conversation: msg.conversation.toString(),
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

        if (convo) {
          const otherParticipantId = convo.participants.find((p) => p.toString() !== userId);
          if (otherParticipantId) {
            io.to(`user:${otherParticipantId}`).emit('messages:read', { conversationId });
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
            conversation: message.conversation.toString(),
          });
        }

        socket.emit('message:edited', {
          messageId,
          content,
          isEdited: true,
          editedAt: message.editedAt,
          conversation: message.conversation.toString(),
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
            conversation: message.conversation.toString(),
          });
        }

        socket.emit('message:deleted', { messageId, forEveryone: deleteForEveryone, conversation: message.conversation.toString() });
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
        const populatedMessage = await populateMessage(message);

        io.to(`user:${message.recipient}`).emit('message:reaction:updated', {
          messageId,
          reactions: populatedMessage.reactions,
          conversation: message.conversation.toString(),
        });
        socket.emit('message:reaction:updated', {
          messageId,
          reactions: populatedMessage.reactions,
          conversation: message.conversation.toString(),
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

        const populatedMessage = await populateMessage(message);
        if (message.recipient) {
          io.to(`user:${message.recipient}`).emit('message:reaction:updated', {
            messageId,
            reactions: populatedMessage.reactions,
            conversation: message.conversation.toString(),
          });
        }
        socket.emit('message:reaction:updated', {
          messageId,
          reactions: populatedMessage.reactions,
          conversation: message.conversation.toString(),
        });
      } catch (error) {
        console.error('Remove reaction error:', error);
      }
    });

    // ==================== Helpers ====================

    const getCall = async (callId) => {
      const call = await Call.findById(callId).lean();
      if (!call) return null;
      return populateCall(call, 'username displayName avatar');
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
      const hasActiveSocket =
        (onlineUserSockets.has(uid) && onlineUserSockets.get(uid).size > 0) ||
        (onlineEmployeeSockets.has(uid) && onlineEmployeeSockets.get(uid).size > 0);
      if (hasActiveSocket) return true;

      const account = await getAccountById(uid, 'status workStatus lastSeen');
      if (!account) return false;
      const isActive = account.status === 'online' || account.workStatus === 'active';
      if (!isActive) return false;
      return Date.now() - new Date(account.lastSeen).getTime() < HEARTBEAT_TIMEOUT_MS;
    };

    const endCallRoom = async (roomId, status, duration = 0) => {
      const callId = roomId.replace('call:', '');
      await callBilling.stopBilling(callId);
      clearCallSignalBuffer(callId);
      clearCallParticipants(callId);
      if (callDisconnectTimeouts.has(roomId)) {
        clearTimeout(callDisconnectTimeouts.get(roomId));
        callDisconnectTimeouts.delete(roomId);
      }
      try {
        const call = await Call.findById(callId).lean();
        if (!call) return;

        const endedAt = new Date();
        const finalDuration =
          duration > 0
            ? duration
            : call.startedAt
              ? Math.round((endedAt - new Date(call.startedAt)) / 1000)
              : 0;

        await Call.findByIdAndUpdate(callId, { status, duration: finalDuration, endedAt });
        const updatedCall = await getCall(callId);
        if (updatedCall) {
          io.to(roomId).emit('call:ended', { call: updatedCall });
          const socketsInRoom = await io.in(roomId).fetchSockets();
          socketsInRoom.forEach((s) => s.leave(roomId));
          userCallRooms.delete(updatedCall.caller._id.toString());
          userCallRooms.delete(updatedCall.receiver._id.toString());
        }
      } catch (err) {
        console.error('End call room error:', err);
      }
    };

    // ==================== WebRTC Signaling ====================

    socket.on('call:initiate', async ({ receiverId, type = 'audio', offer }) => {
      try {
        console.log(`[Call] ${userId} initiating call to ${receiverId}`);
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

        const [receiverAccount, callerAccount] = await Promise.all([
          getAccountById(receiverId, 'blockedUsers callRate username displayName avatar'),
          getAccountById(userId, 'username displayName avatar blockedUsers walletBalance'),
        ]);

        if (!receiverAccount) {
          socket.emit('call:error', { message: 'Receiver not found', receiverId });
          return;
        }

        const receiverBlocked = (receiverAccount.blockedUsers || []).map((id) => id.toString());
        const callerBlocked = (callerAccount.blockedUsers || []).map((id) => id.toString());
        if (receiverBlocked.includes(userId) || callerBlocked.includes(receiverId)) {
          socket.emit('call:error', { message: 'Cannot call this user', receiverId });
          return;
        }

        if (isUserBusy(receiverId)) {
          socket.emit('call:error', { message: 'User is busy', receiverId });
          return;
        }

        const ratePerMinute = callBilling.getEffectiveRate(receiverAccount, receiverAccount.callRate);
        if (ratePerMinute > 0 && !(await callBilling.hasSufficientBalance(userId, ratePerMinute))) {
          socket.emit('call:error', {
            message: 'Insufficient balance to start this call',
            receiverId,
            ratePerMinute,
          });
          return;
        }

        const call = await Call.create({
          caller: userId,
          receiver: receiverId,
          type: type || 'audio',
          status: 'ringing',
          ratePerMinute,
          signalData: { offer: { type: offer.type, sdp: offer.sdp } },
        });

        const populatedCall = await getCall(call._id);

        const roomId = `call:${call._id}`;
        socket.join(roomId);
        userCallRooms.set(userId, roomId);
        setCallParticipants(call._id.toString(), userId, receiverId);

        io.to(`user:${receiverId}`).emit('call:incoming', {
          call: populatedCall,
          caller: callerAccount,
          roomId,
        });

        socket.emit('call:ringing', { call: populatedCall, roomId });
      } catch (error) {
        console.error('Call initiate error:', error);
        socket.emit('call:error', { message: 'Failed to initiate call' });
      }
    });

    socket.on('call:accept', async ({ callId, roomId }) => {
      try {
        console.log(`[Call] ${userId} accepting call ${callId}`);
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
        setCallParticipants(callId, call.caller._id.toString(), call.receiver._id.toString());

        // Flush any signals that arrived before the receiver joined the room
        await flushCallSignalBuffer(io, roomId);

        await Call.findByIdAndUpdate(callId, {
          status: 'ongoing',
          startedAt: new Date(),
        });

        await callBilling.startBilling(callId, roomId, io, () => endCallRoom(roomId, 'ended'));

        const updatedCall = await getCall(callId);
        io.to(roomId).emit('call:accepted', { call: updatedCall, roomId });

        // Send the caller's offer to the receiver so they can create an answer
        if (call.signalData?.offer) {
          console.log(`[Call] Sending stored offer to receiver ${userId}`);
          socket.emit('call:signal', {
            callId,
            signal: { sdp: { type: call.signalData.offer.type, sdp: call.signalData.offer.sdp } },
            from: call.caller._id.toString(),
          });
        } else {
          console.log(`[Call] No stored offer found for call ${callId}`);
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

        await callBilling.stopBilling(callId);

        await Call.findByIdAndUpdate(callId, { status: 'rejected', endedAt: new Date() });

        const otherUserId = call.caller._id.toString() === userId
          ? call.receiver._id.toString()
          : call.caller._id.toString();

        io.to(`user:${otherUserId}`).emit('call:rejected', { call: call });
        clearCallSignalBuffer(callId);
        clearCallParticipants(callId);
        userCallRooms.delete(userId);
        userCallRooms.delete(otherUserId);
      } catch (error) {
        console.error('Call reject error:', error);
      }
    });

    socket.on('call:end', async ({ callId, duration }) => {
      try {
        console.log(`[Call] ${userId} ending call ${callId}`);
        const call = await getCall(callId);
        if (!call || !isParticipant(call, userId)) return;
        if (['ended', 'rejected', 'missed'].includes(call.status)) return;

        await callBilling.stopBilling(callId);

        const endedAt = new Date();
        const finalDuration =
          duration > 0
            ? duration
            : call.startedAt
              ? Math.round((endedAt - new Date(call.startedAt)) / 1000)
              : 0;

        await Call.findByIdAndUpdate(callId, {
          status: 'ended',
          duration: finalDuration,
          endedAt,
        });

        const roomId = `call:${callId}`;
        io.to(roomId).emit('call:ended', { call: call });

        const socketsInRoom = await io.in(roomId).fetchSockets();
        socketsInRoom.forEach((s) => s.leave(roomId));
        clearCallSignalBuffer(callId);
        clearCallParticipants(callId);
        userCallRooms.delete(call.caller._id.toString());
        userCallRooms.delete(call.receiver._id.toString());
      } catch (error) {
        console.error('Call end error:', error);
      }
    });

    socket.on('call:signal', async ({ callId, signal }) => {
      try {
        const signalType = signal?.sdp?.type || 'candidate';
        console.log(`[Call] ${userId} forwarding signal ${signalType} for call ${callId}`);

        // Fast path: use cached participant info to avoid a DB query per ICE candidate
        let isParticipant = isCallParticipant(callId, userId);
        let status = 'ongoing';
        if (!isParticipant) {
          const call = await getCall(callId);
          if (!call) {
            console.log(`[Call] Signal rejected: call not found`);
            return;
          }
          isParticipant = call.caller._id.toString() === userId || call.receiver._id.toString() === userId;
          status = call.status;
          if (isParticipant) {
            setCallParticipants(callId, call.caller._id.toString(), call.receiver._id.toString());
          }
        }
        if (!isParticipant) {
          console.log(`[Call] Signal rejected: not a participant`);
          return;
        }
        // For the cached fast path, assume the call is still ongoing if it is in the cache.
        // The DB fallback above already captured the real status.
        if (!['ringing', 'ongoing'].includes(status)) {
          console.log(`[Call] Signal rejected: call status is ${status}`);
          return;
        }

        const roomId = `call:${callId}`;
        const delivered = await forwardOrBufferCallSignal(io, roomId, socket.id, { callId, signal, from: userId });
        console.log(`[Call] Signal ${delivered ? 'delivered' : 'buffered'} for call ${callId}`);
      } catch (error) {
        console.error('Call signal error:', error);
      }
    });

    socket.on('call:missed', async ({ callId }) => {
      try {
        const call = await getCall(callId);
        if (!call || !isParticipant(call, userId)) return;
        if (call.status !== 'ringing') return;

        await callBilling.stopBilling(callId);

        await Call.findByIdAndUpdate(callId, { status: 'missed', endedAt: new Date() });

        const roomId = `call:${callId}`;
        const updatedCall = await getCall(callId);
        io.to(roomId).emit('call:missed', { call: updatedCall });
        clearCallSignalBuffer(callId);
        clearCallParticipants(callId);

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
      try {
      const isEmployee = socket.isEmployee;
      console.log(`${isEmployee ? 'Employee' : 'User'} disconnected: ${userId} socket ${socket.id}`);

      if (isEmployee) {
        const employeeSocketSet = onlineEmployeeSockets.get(userId);
        if (employeeSocketSet) {
          employeeSocketSet.delete(socket.id);
          if (employeeSocketSet.size === 0) {
            onlineEmployeeSockets.delete(userId);
            // Don't emit offline immediately — wait for the grace period.
            // If the employee reconnects within the window, the timeout is cancelled
            // and no flicker happens. scheduleEmployeeOffline handles the eventual emit.
            scheduleEmployeeOffline(io, userId);
          }
        }
      } else {
        const userSocketSet = onlineUserSockets.get(userId);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            onlineUserSockets.delete(userId);
            // Same grace-period logic as above for users.
            scheduleUserOffline(io, userId);
          }
        }
      }

      // Only end the call room if this socket was the one participating in the call
      const roomId = userCallRooms.get(userId);
      if (roomId) {
        try {
          const stillInRoom = await io.in(roomId).fetchSockets();
          const userStillInRoom = stillInRoom.some((s) => s.userId === userId);
          if (!userStillInRoom) {
            console.log(`[Call] ${userId} disconnected from call ${roomId}, scheduling grace period`);
            // Give the user a chance to reconnect before ending the call
            if (callDisconnectTimeouts.has(roomId)) {
              clearTimeout(callDisconnectTimeouts.get(roomId));
            }
            const timeout = setTimeout(async () => {
              try {
                callDisconnectTimeouts.delete(roomId);
                const currentSockets = await io.in(roomId).fetchSockets();
                const rejoined = currentSockets.some((s) => s.userId === userId);
                if (!rejoined) {
                  console.log(`[Call] Grace period expired, ending call ${roomId}`);
                  await endCallRoom(roomId, 'ended');
                } else {
                  console.log(`[Call] ${userId} rejoined call ${roomId} during grace period`);
                }
              } catch (callErr) {
                console.error('[Call] Error ending call room after disconnect:', callErr);
              }
            }, CALL_DISCONNECT_GRACE_PERIOD_MS);
            callDisconnectTimeouts.set(roomId, timeout);
          }
        } catch (roomErr) {
          console.error('[Call] Error fetching call room sockets on disconnect:', roomErr);
        }
      }
    } catch (err) {
      console.error('Error in socket disconnect handler:', err);
    }
    });
  });

  // Clean up the stale-user interval when the process shuts down
  const cleanup = () => {
    clearInterval(staleCleanupInterval);
    process.exit(0);
  };
  process.once('SIGINT', cleanup);
  process.once('SIGTERM', cleanup);
};

module.exports = setupSocket;
