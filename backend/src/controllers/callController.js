const Call = require('../models/Call');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');

const initiateCall = asyncHandler(async (req, res) => {
  const { receiverId, type = 'audio' } = req.body;

  if (!receiverId) throw new AppError('Receiver ID is required', 400);
  if (receiverId === req.userId.toString()) throw new AppError('Cannot call yourself', 400);

  const receiver = await User.findById(receiverId);
  if (!receiver) throw new AppError('Receiver not found', 404);

  if (receiver.blockedUsers.includes(req.userId) || req.user.blockedUsers.includes(receiverId)) {
    throw new AppError('Cannot call this user', 403);
  }

  const call = await Call.create({
    caller: req.userId,
    receiver: receiverId,
    type,
    status: 'initiated',
  });

  await call.populate('caller', 'username displayName avatar');
  await call.populate('receiver', 'username displayName avatar');

  ApiResponse.success(res, call, 'Call initiated', 201);
});

const getCallHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, userId } = req.query;

  const query = {
    $or: [{ caller: req.userId }, { receiver: req.userId }],
  };

  if (userId) {
    query.$or = [
      { caller: req.userId, receiver: userId },
      { caller: userId, receiver: req.userId },
    ];
  }

  const calls = await Call.find(query)
    .populate('caller', 'username displayName avatar')
    .populate('receiver', 'username displayName avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Call.countDocuments(query);

  ApiResponse.paginated(res, calls, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
  });
});

const getCallById = asyncHandler(async (req, res) => {
  const { callId } = req.params;

  const call = await Call.findById(callId)
    .populate('caller', 'username displayName avatar')
    .populate('receiver', 'username displayName avatar');

  if (!call) throw new AppError('Call not found', 404);

  const isParticipant = call.caller._id.toString() === req.userId.toString() ||
    call.receiver._id.toString() === req.userId.toString();

  if (!isParticipant) throw new AppError('Not authorized', 403);

  ApiResponse.success(res, call);
});

const updateCallStatus = asyncHandler(async (req, res) => {
  const { callId } = req.params;
  const { status, duration, quality } = req.body;

  const call = await Call.findById(callId);
  if (!call) throw new AppError('Call not found', 404);

  const isParticipant = call.caller.toString() === req.userId.toString() ||
    call.receiver.toString() === req.userId.toString();

  if (!isParticipant) throw new AppError('Not authorized', 403);

  if (status) call.status = status;
  if (duration !== undefined) call.duration = duration;
  if (quality) call.quality = { ...call.quality, ...quality };

  if (status === 'ongoing' && !call.startedAt) {
    call.startedAt = new Date();
    call.participants.push({ user: req.userId, joinedAt: new Date() });
  }

  if (['ended', 'missed', 'rejected'].includes(status) && !call.endedAt) {
    call.endedAt = new Date();
  }

  await call.save();

  if (status === 'missed' || status === 'ended') {
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

    const isMissed = status === 'missed';
    const callDuration = duration || 0;
    const durationStr = callDuration > 0
      ? `${Math.floor(callDuration / 60)}:${String(callDuration % 60).padStart(2, '0')}`
      : '';

    const systemMessage = await Message.create({
      conversation: conversation._id,
      sender: req.userId,
      recipient: call.caller.toString() === req.userId.toString() ? call.receiver : call.caller,
      type: 'system',
      isSystemMessage: true,
      content: isMissed
        ? 'Missed voice call'
        : `Voice call ended${durationStr ? ` (${durationStr})` : ''}`,
      callReference: call._id,
    });

    conversation.lastMessage = systemMessage._id;
    await conversation.save();
  }

  ApiResponse.success(res, call, 'Call updated');
});

const getMissedCalls = asyncHandler(async (req, res) => {
  const missedCalls = await Call.find({
    receiver: req.userId,
    status: 'missed',
  })
    .populate('caller', 'username displayName avatar')
    .sort({ createdAt: -1 });

  ApiResponse.success(res, missedCalls);
});

module.exports = {
  initiateCall,
  getCallHistory,
  getCallById,
  updateCallStatus,
  getMissedCalls,
};
