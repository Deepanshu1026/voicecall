const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Appointment = require('../models/Appointment');
const MeetingSettings = require('../models/MeetingSettings');
const Notification = require('../models/Notification');
const OtpVerification = require('../models/OtpVerification');
const CancelledDate = require('../models/CancelledDate');
const Post = require('../models/Post');
const { generateTokens } = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/ApiResponse');
const config = require('../config');
const { handleMulterError } = require('../middleware/upload');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const multerUpload = require('../utils/upload');
const { getChatSettings } = require('../services/settingService');
const { recordLogin } = require('../services/loginHistoryService');
const { notifyMessageReceived } = require('../services/messageNotificationService');
const { getAccountById } = require('../utils/account');

const FAR_FUTURE = new Date('2099-12-31T23:59:59.999Z');

const DEFAULT_AVATAR_URL = `${config.serverUrl}/images/user/avatar.webp`;

// Normalize any avatar/path to a usable absolute URL. Migrated old PHP paths
// like `img/...` and broken placeholders are remapped to the new static host.
const avatarUrl = (avatar) => {
  if (!avatar) return DEFAULT_AVATAR_URL;
  let value = avatar;
  if (typeof avatar === 'object') value = avatar.url || avatar.src || '';
  if (typeof value !== 'string') return DEFAULT_AVATAR_URL;
  value = value.trim().replace(/\\/g, '/');
  if (!value) return DEFAULT_AVATAR_URL;

  const lower = value.toLowerCase();
  if (
    lower === 'default_avatar.png' ||
    lower === '/default_avatar.png' ||
    lower === 'img/userdemo.webp' ||
    lower === '/img/userdemo.webp' ||
    lower === '/images/user/userdemo.webp'
  ) {
    return DEFAULT_AVATAR_URL;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    // If the old PHP domain is still in the stored value, keep the path but
    // point it at the new static host so the file can be served by the alias.
    const oldDomainMatch = value.match(/^https?:\/\/avisaexperts\.com(\/.*)?$/i);
    if (oldDomainMatch) {
      return `${config.serverUrl}${oldDomainMatch[1] || ''}`;
    }
    return value;
  }

  // Old PHP site stored files under `img/`. Serve them from the new `/images/user/`.
  if (value.startsWith('img/') || value.startsWith('/img/')) {
    const fileName = value.replace(/^\/?img\//, '');
    return `${config.serverUrl}/images/user/${fileName}`;
  }

  // Relative paths: prepend server root.
  if (value.startsWith('/')) return `${config.serverUrl}${value}`;
  return `${config.serverUrl}/${value}`;
};

// Resolve a string id to a MongoDB ObjectId. If it's already a valid ObjectId it is used
// directly; otherwise we look it up as an Employee/User sqlId or numeric id.
const resolveId = async (id) => {
  const mongoose = require('mongoose');
  if (!id) return null;
  const idStr = id.toString().trim();
  if (mongoose.Types.ObjectId.isValid(idStr)) {
    try {
      return new mongoose.Types.ObjectId(idStr);
    } catch (e) {
      // fall through to lookup
    }
  }
  const numericId = parseInt(idStr, 10);
  if (Number.isNaN(numericId) && !idStr) return null;
  const query = Number.isNaN(numericId) ? { sqlId: idStr } : { $or: [{ sqlId: numericId }, { sqlId: idStr }] };
  const emp = await Employee.findOne(query).select('_id').lean();
  if (emp) return emp._id;
  const user = await User.findOne(query).select('_id').lean();
  if (user) return user._id;
  return null;
};

// ==================== AUTH ====================

// Mobile app login (email or phone)
router.post('/login', asyncHandler(async (req, res) => {
  const { login_input, password, country_code } = req.body;
  if (!login_input || !password) {
    throw new AppError('Login input and password are required', 400);
  }

  let user;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login_input)) {
    user = await User.findOne({ email: login_input.toLowerCase().trim(), role: 'user' }).select('+password');
  } else if (/^\d+$/.test(login_input)) {
    if (!country_code) throw new AppError('Country code is required for phone login', 400);
    user = await User.findOne({ mobile: login_input.trim(), role: 'user' }).select('+password');
  } else {
    throw new AppError('Please provide a valid email or phone number', 400);
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid credentials', 401);
  }

  const tokens = generateTokens(user._id);
  // Mark user online and update lastSeen on successful login
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken, status: 'online', lastSeen: new Date() });

  ApiResponse.success(res, {
    user_id: user._id,
    name: user.displayName || user.username,
    email: user.email,
    phone: user.mobile,
    user_profile: avatarUrl(user.avatar),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }, 'Login successful');
}));

// Mobile app signup
router.post('/register', asyncHandler(async (req, res) => {
  const { username, phone, email, password, country_code } = req.body;
  if (!username || !phone || !email || !password) {
    throw new AppError('All fields are required', 400);
  }
  if (password.length < 6) throw new AppError('Password must be at least 6 characters', 400);
  if (!/^\d{6,15}$/.test(phone)) throw new AppError('Invalid phone number', 400);

  const existing = await User.findOne({
    $or: [{ email: email.toLowerCase().trim() }, { mobile: phone.trim() }],
  });
  if (existing) {
    const field = existing.email === email.toLowerCase().trim() ? 'email' : 'phone';
    throw new AppError(`Account with this ${field} already exists`, 409);
  }

  const user = await User.create({
    username: username.trim(),
    email: email.toLowerCase().trim(),
    mobile: phone.trim(),
    password,
    displayName: username.trim(),
    role: 'user',
    countryCode: country_code || '',
    loginFrom: 'app',
    status: 'online',
  });

  ApiResponse.success(res, { user_id: user._id }, 'Registration successful', 201);
}));

// Guest creation (mobile app or web widget)
router.post('/guest', asyncHandler(async (req, res) => {
  const { loginFrom = 'app' } = req.body;
  let user = null;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const username = `guest${suffix}`;
    const email = `guest${suffix}@auto.example`;

    try {
      user = await User.create({
        username,
        email,
        password: crypto.randomBytes(8).toString('hex'),
        displayName: `Guest ${suffix.slice(-4)}`,
        role: 'user',
        status: 'online',
        loginFrom: loginFrom === 'web' ? 'web' : 'app',
      });
      break;
    } catch (err) {
      if (err.code === 11000) {
        attempts += 1;
        continue;
      }
      throw err;
    }
  }

  if (!user) {
    throw new AppError('Failed to create guest user after multiple attempts', 500);
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });
  await recordLogin(user, req);

  res.status(201).json({
    status: 'success',
    user_name: user.displayName || user.username,
    user_email: user.email,
    user_id: user._id.toString(),
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
}));

// Consultant/agent login (mobile app)
router.get('/agent-login', asyncHandler(async (req, res) => {
  const { useremail, password } = req.query;
  if (!useremail || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const cleanEmail = useremail.toString().trim().toLowerCase();
  const cleanPassword = password.toString().trim();

  const employee = await Employee.findOne({ email: cleanEmail }).select('+password');
  if (!employee) {
    throw new AppError('User not found', 404);
  }

  if (employee.status === 'inactive') {
    throw new AppError('Account is disabled', 403);
  }

  const isValid = await employee.comparePassword(cleanPassword);
  if (!isValid) {
    throw new AppError('Invalid password', 401);
  }

  const sessionToken = crypto.randomBytes(32).toString('hex');
  const tokens = generateTokens(employee._id);

  employee.sessionToken = sessionToken;
  employee.refreshToken = tokens.refreshToken;
  employee.workStatus = 'active';
  employee.lastSeen = new Date();
  await employee.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
      data: {
        user_id: employee._id.toString(),
        name: employee.displayName || employee.username,
        email: employee.email,
        role: employee.role || 'Agent',
        profile: employee.avatar || '',
        expertise: employee.expertise || '',
        language: employee.languages || '',
        experience: employee.experience || 0,
        total_order: employee.totalOrder || 0,
        session_token: sessionToken,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
  });
}));

// Forgot password
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError('Email is required', 400);

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw new AppError('No account found with this email', 404);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await OtpVerification.create({
    userId: user._id,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  // In production, send email via Brevo/Sendinblue
  console.log(`OTP for ${email}: ${otp}`);

  res.json({ success: true, message: 'OTP sent to your email', user_id: user._id });
}));

// Verify OTP
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { otp, user_id } = req.body;
  if (!otp || !user_id) throw new AppError('OTP and user ID are required', 400);

  const record = await OtpVerification.findOne({ userId: user_id }).sort({ createdAt: -1 });
  if (!record) throw new AppError('No OTP found', 404);
  if (record.otp !== otp) throw new AppError('Invalid OTP', 400);
  if (new Date() > record.expiresAt) throw new AppError('OTP has expired', 400);

  await OtpVerification.deleteOne({ _id: record._id });
  res.json({ success: true, message: 'OTP verified' });
}));

// Reset password
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { user_id, new_password, confirm_password } = req.body;
  if (!user_id || !new_password || !confirm_password) {
    throw new AppError('All fields are required', 400);
  }
  if (new_password !== confirm_password) throw new AppError('Passwords do not match', 400);
  if (new_password.length < 6) throw new AppError('Password must be at least 6 characters', 400);

  const hash = await bcrypt.hash(new_password, 12);
  await User.findByIdAndUpdate(user_id, { password: hash });
  await OtpVerification.deleteMany({ userId: user_id });

  res.json({ success: true, message: 'Password reset successfully' });
}));

// ==================== CONSULTANTS ====================

router.get('/consultants', asyncHandler(async (req, res) => {
  const agents = await Employee.find({
    $or: [{ role: 'case_manager' }, { role: { $in: ['manager', 'senior_manager'] } }],
  }).select('displayName username avatar expertise languages experience totalOrder workStatus callRate email mobile countryCode')
    .lean();

  const data = agents.map((a) => ({
    id: a._id,
    user_name: a.displayName || a.username,
    expertise: a.expertise || '',
    language: a.languages || '',
    total_order: a.totalOrder || 0,
    experience: a.experience || 0,
    user_current_status: a.workStatus || 'Unavailable',
    user_role: 'Agent',
    user_profile: avatarUrl(a.avatar),
    call_rate: a.callRate || 0,
  }));

  data.sort((a, b) => {
    const order = { active: 0, on_call: 1, unavailable: 2 };
    return (order[a.user_current_status.toLowerCase()] || 2) - (order[b.user_current_status.toLowerCase()] || 2);
  });

  res.json({ success: true, message: 'Consultants fetched', data });
}));

// ==================== USER PROFILE ====================

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('displayName username email mobile avatar');
  if (!user) throw new AppError('User not found', 404);

  res.json({
    success: true,
    message: 'User fetched',
    data: {
      user_name: user.displayName || user.username,
      user_email: user.email,
      user_mobile: user.mobile,
    user_profile: avatarUrl(user.avatar),
    },
  });
}));

const profileUpload = multerUpload.single('profile');

// GET version for no-image updates
router.get('/edit-profile', asyncHandler(async (req, res) => {
  const { userid, name, contact, email } = req.query;
  if (!userid || !name || !contact || !email) {
    throw new AppError('userid, name, contact, email are required', 400);
  }

  const mongoose = require('mongoose');
  const userObjectId = mongoose.Types.ObjectId.isValid(userid) ? new mongoose.Types.ObjectId(userid) : null;
  if (!userObjectId) throw new AppError('Invalid userid', 400);

  const cleanEmail = email.toLowerCase().trim();
  const cleanMobile = contact.trim();
  const duplicate = await User.findOne({
    _id: { $ne: userObjectId },
    $or: [{ email: cleanEmail }, { mobile: cleanMobile }],
  });
  if (duplicate) {
    const field = duplicate.email === cleanEmail ? 'email' : 'phone';
    throw new AppError(`Another account with this ${field} already exists`, 409);
  }

  const update = { displayName: name.trim(), mobile: cleanMobile, email: cleanEmail };
  await User.findByIdAndUpdate(userid, update);

  const user = await User.findById(userid).select('displayName username email mobile avatar');
  ApiResponse.success(res, {
    userid,
    name: user.displayName,
    contact: user.mobile,
    email: user.email,
    profile_url: avatarUrl(user.avatar),
    user_profile: avatarUrl(user.avatar),
  }, 'Profile updated');
}));

router.post('/edit-profile', profileUpload, handleMulterError, asyncHandler(async (req, res) => {
  const { userid, name, contact, email } = req.body;
  if (!userid || !name || !contact || !email) {
    throw new AppError('userid, name, contact, email are required', 400);
  }

  const mongoose = require('mongoose');
  const userObjectId = mongoose.Types.ObjectId.isValid(userid) ? new mongoose.Types.ObjectId(userid) : null;
  if (!userObjectId) throw new AppError('Invalid userid', 400);

  const cleanEmail = email.toLowerCase().trim();
  const cleanMobile = contact.trim();
  const duplicate = await User.findOne({
    _id: { $ne: userObjectId },
    $or: [{ email: cleanEmail }, { mobile: cleanMobile }],
  });
  if (duplicate) {
    const field = duplicate.email === cleanEmail ? 'email' : 'phone';
    throw new AppError(`Another account with this ${field} already exists`, 409);
  }

  const update = { displayName: name.trim(), mobile: cleanMobile, email: cleanEmail };

  // Handle file upload for profile picture
  if (req.file) {
    if (config.cloudinary && config.cloudinary.cloudName) {
      const result = await uploadToCloudinary(req.file.path, {
        folder: 'voicecall/profiles',
        resourceType: 'image',
        transformation: { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      });
      update.avatar = { url: result.url, publicId: result.public_id };
    } else {
      const profilePath = `/uploads/profiles/${req.file.filename}`;
      update.avatar = { url: profilePath, publicId: '' };
    }
  }

  await User.findByIdAndUpdate(userid, update);

  const user = await User.findById(userid).select('displayName username email mobile avatar');
  ApiResponse.success(res, {
    userid,
    name: user.displayName,
    contact: user.mobile,
    email: user.email,
    profile_url: avatarUrl(user.avatar),
    user_profile: avatarUrl(user.avatar),
  }, 'Profile updated');
}));

// ==================== MESSAGES / INBOX ====================

router.get('/inbox', asyncHandler(async (req, res) => {
  const { receiver_id } = req.query;
  if (!receiver_id) throw new AppError('receiver_id is required', 400);

  const Message = require('../models/Message');
  const Conversation = require('../models/Conversation');

  const receiverOid = await resolveId(receiver_id);
  if (!receiverOid) {
    return res.json({ success: true, user_id: receiver_id, inbox: [], total_contacts: 0, total_unread_count: 0 });
  }
  const effectiveReceiverId = receiverOid.toString();

  const conversations = await Conversation.find({ participants: receiverOid, type: 'direct' })
    .sort({ updatedAt: -1 })
    .populate('lastMessage', 'createdAt content sender status readBy')
    .lean();
  if (!conversations.length) {
    return res.json({ success: true, user_id: effectiveReceiverId, inbox: [], total_contacts: 0, total_unread_count: 0 });
  }

  const conversationIds = conversations.map((c) => c._id);
  const otherParticipantIds = conversations
    .map((c) => c.participants.find((p) => p.toString() !== effectiveReceiverId))
    .filter(Boolean);

  // Batch fetch participants
  const [users, employees] = await Promise.all([
    User.find({ _id: { $in: otherParticipantIds } }).select('displayName username avatar workStatus status').lean(),
    Employee.find({ _id: { $in: otherParticipantIds } }).select('displayName username avatar workStatus status').lean(),
  ]);
  const participantMap = new Map();
  [...users, ...employees].forEach((p) => participantMap.set(p._id.toString(), p));

  const inbox = [];
  let totalUnread = 0;

  for (const conv of conversations) {
    const otherParticipant = conv.participants.find((p) => p.toString() !== effectiveReceiverId);
    if (!otherParticipant) continue;
    const other = participantMap.get(otherParticipant.toString());
    if (!other) continue;

    const lastMsg = conv.lastMessage;
    if (!lastMsg) continue;

    const isFromMe = lastMsg.sender?.toString() === effectiveReceiverId;
    const receiverOidString = receiverOid.toString();
    const unreadCount = (conv.unreadCount || []).find((u) => u.user?.toString() === receiverOidString)?.count || 0;
    totalUnread += unreadCount;

    const agentProfile = (other.avatar && typeof other.avatar === 'object' ? other.avatar.url : other.avatar) || '';
    const isRead = isFromMe ? 'yes' : (lastMsg.status === 'seen' || lastMsg.status === 'read' || (lastMsg.readBy || []).map((id) => id.toString()).includes(receiverOidString) ? 'yes' : 'no');

    inbox.push({
      agent_id: otherParticipant.toString(),
      agent_name: other.displayName || other.username || 'Unknown',
      agent_profile: agentProfile,
      user_current_status: other.workStatus || other.status || 'Unavailable',
      last_message: lastMsg.content || (lastMsg.type === 'file' ? '📎 File' : ''),
      created_at: lastMsg.createdAt,
      last_message_type: isFromMe ? 'sent' : 'received',
      last_message_read_status: lastMsg.status || 'sent',
      is_read: isRead,
      unread_count: unreadCount,
      has_unread_messages: unreadCount > 0,
      is_last_message_from_me: isFromMe,
    });
  }

  inbox.sort((a, b) => {
    if (a.unread_count !== b.unread_count) return b.unread_count - a.unread_count;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  res.json({
    success: true,
    user_id: receiver_id,
    inbox,
    total_contacts: inbox.length,
    total_unread_count: totalUnread,
  });
}));

// ==================== TICKETS (APPOINTMENTS) ====================

router.post('/tickets', asyncHandler(async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) throw new AppError('user_id is required', 400);

  const tickets = await Appointment.find({
    $or: [{ userId: user_id }, { sqlUserId: parseInt(user_id) || user_id }],
  }).sort({ submissionTime: -1 }).lean();

  const data = tickets.map((t) => ({
    id: t._id,
    name: t.name,
    email: t.email,
    address: t.address,
    contact: t.contact,
    querry: t.query,
    mode: t.mode,
    date: t.date,
    selected_plan: t.selectedPlan,
    time_slot: t.timeSlot,
    submission_time: t.submissionTime,
    meeting_confirm: t.meetingConfirm,
    screenshot: t.screenshot,
    reference_id: t.referenceId,
  }));

  res.json({ count: data.length, data });
}));

// ==================== MESSAGE TEMPLATES (agent) ====================

const MessageTemplate = require('../models/MessageTemplate');

router.get('/templates', asyncHandler(async (req, res) => {
  const { agent_id } = req.query;
  if (!agent_id) return res.json({ success: true, templates: [] });
  const agentOid = await resolveId(agent_id);
  if (!agentOid) return res.json({ success: true, templates: [] });
  const templates = await MessageTemplate.find({ agentId: agentOid })
    .sort({ createdAt: -1 })
    .select('title content createdAt')
    .lean();
  const data = templates.map((t) => ({
    id: t._id.toString(),
    title: t.title,
    content: t.content,
    created_at: t.createdAt,
  }));
  res.json({ success: true, templates: data });
}));

router.post('/templates', asyncHandler(async (req, res) => {
  const { agent_id, title, content } = req.body;
  if (!agent_id || !title?.trim() || !content?.trim()) {
    throw new AppError('agent_id, title, and content are required', 400);
  }
  const agentOid = await resolveId(agent_id);
  if (!agentOid) throw new AppError('Agent not found', 404);
  const template = await MessageTemplate.create({
    agentId: agentOid,
    title: title.trim(),
    content: content.trim(),
  });
  res.status(201).json({ success: true, template: { id: template._id.toString(), title: template.title, content: template.content, created_at: template.createdAt } });
}));

router.put('/templates/:id', asyncHandler(async (req, res) => {
  const { agent_id, title, content } = req.body;
  if (!agent_id || !title?.trim() || !content?.trim()) {
    throw new AppError('agent_id, title, and content are required', 400);
  }
  const agentOid = await resolveId(agent_id);
  if (!agentOid) throw new AppError('Agent not found', 404);
  const template = await MessageTemplate.findOneAndUpdate(
    { _id: req.params.id, agentId: agentOid },
    { title: title.trim(), content: content.trim() },
    { new: true }
  );
  if (!template) throw new AppError('Template not found', 404);
  res.json({ success: true, template: { id: template._id.toString(), title: template.title, content: template.content, created_at: template.createdAt } });
}));

router.delete('/templates/:id', asyncHandler(async (req, res) => {
  const { agent_id } = req.query;
  if (!agent_id) throw new AppError('agent_id is required', 400);
  const agentOid = await resolveId(agent_id);
  if (!agentOid) throw new AppError('Agent not found', 404);
  const template = await MessageTemplate.findOneAndDelete({ _id: req.params.id, agentId: agentOid });
  if (!template) throw new AppError('Template not found', 404);
  res.json({ success: true });
}));

// ==================== NOTIFICATIONS ====================

router.get('/notifications', asyncHandler(async (req, res) => {
  const { user_id, page = 1, limit = 20 } = req.query;
  if (!user_id) {
    return res.json({ success: true, notifications: [], message: 'user_id is required' });
  }

  // Resolve the ID in case the Flutter app passes a numeric SQL ID from old accounts
  const resolvedId = await resolveId(user_id);
  const oid = resolvedId || user_id;

  // Find the user (or employee) so we can exclude global notifications created before they joined
  const account =
    (await User.findById(oid).select('createdAt').lean()) ||
    (await Employee.findById(oid).select('createdAt').lean());
  if (!account) {
    return res.json({ success: true, notifications: [] });
  }

  const joinedAt = account.createdAt || new Date(0);
  const filter = {
    $or: [
      { userId: oid },
      // Global notifications only if created after the user joined the platform
      { userId: { $exists: false }, createdAt: { $gte: joinedAt } },
    ],
  };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Notification.countDocuments(filter),
  ]);

  const data = notifications.map((n) => ({
    id: n._id,
    title: n.title,
    message: n.message,
    type: n.type || 'general',
    media_path: n.mediaPath,
    is_read: n.isRead,
    link: n.link || '',
    date: n.createdAt ? new Date(n.createdAt).toISOString().split('T')[0] : '',
    time: n.createdAt ? new Date(n.createdAt).toTimeString().split(' ')[0] : '',
    created_at: n.createdAt,
  }));

  res.json({
    success: true,
    notifications: data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
}));

// Mark notification as read
router.patch('/notifications/:id/read', asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
}));

// ==================== FCM TOKEN ====================

router.post('/fcm-token', asyncHandler(async (req, res) => {
  const { token, user_id, device } = req.body;
  if (!token || !user_id) throw new AppError('token and user_id are required', 400);
  if (token.length < 10) throw new AppError('Invalid token', 400);

  const FcmToken = require('../models/FcmToken');
  await FcmToken.findOneAndUpdate(
    { token },
    { userId: user_id, device: device || 'A', updatedAt: new Date() },
    { upsert: true, new: true }
  );

  res.json({ status: 'success', message: 'Token saved' });
}));

// ==================== APPOINTMENTS ====================

router.post('/appointments', asyncHandler(async (req, res) => {
  const { selected_plan, name, email, contact, datetime, mode, time_slot, querry, address, user_id, reference_number } = req.body;

  if (!selected_plan || !name || !email || !contact || !datetime || !mode || !time_slot) {
    throw new AppError('selected_plan, name, email, contact, datetime, mode, time_slot are required', 400);
  }

  const refId = reference_number || `AVE${Date.now().toString(36).toUpperCase()}`;
  const date = datetime.split(' ')[0] || '';
  const selectedPlanLower = selected_plan.toLowerCase();

  // Calculate end time (add 30 minutes to start)
  const timeParts = time_slot.split(':');
  let endTime = time_slot;
  if (timeParts.length >= 2) {
    const h = parseInt(timeParts[0], 10);
    const m = parseInt(timeParts[1], 10) + 30;
    const endH = m >= 60 ? h + 1 : h;
    const endM = m % 60;
    endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}:00`;
  }

  // Idempotency: avoid duplicate bookings from double clicks / double effects.
  // If the same contact already has an uncancelled appointment for the same
  // plan, date, time slot and mode created within the last 2 minutes, return it.
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const existing = await Appointment.findOne({
    contact: contact.trim(),
    selectedPlan: selectedPlanLower,
    date,
    timeSlot: time_slot,
    mode,
    meetingConfirm: { $ne: 'cancelled' },
    createdAt: { $gte: twoMinutesAgo },
  }).sort({ createdAt: -1 }).lean();

  if (existing) {
    const settings = await MeetingSettings.getSingleton();
    return res.json({
      status: 'success',
      message: 'Appointment already booked',
      reference_id: existing.referenceId || refId,
      appointment: {
        plan: selected_plan,
        name: existing.name,
        datetime,
        time: existing.timeSlot,
        mode: existing.mode,
        start_time: existing.timeSlot,
        end_time: endTime,
        address: existing.address || '',
        meeting_confirm: existing.meetingConfirm,
        user_id: existing.userId || null,
      },
      current_prices: {
        advance: String(settings.advancePrice),
        premium: String(settings.premiumPrice),
      },
    });
  }

  const appointment = await Appointment.create({
    userId: user_id || null,
    name: name.trim(),
    email: email.trim(),
    contact: contact.trim(),
    address: address || '',
    query: querry || '',
    mode,
    date: datetime.split(' ')[0] || '',
    selectedPlan: selected_plan.toLowerCase(),
    timeSlot: time_slot,
    referenceId: refId,
    datetime,
    meetingConfirm: 'pending',
  });

  // Live prices from MeetingSettings
  const settings = await MeetingSettings.getSingleton();

  res.json({
    status: 'success',
    message: 'Appointment booked successfully',
    reference_id: refId,
    appointment: {
      plan: selected_plan,
      name: name.trim(),
      datetime,
      time: time_slot,
      mode,
      start_time: time_slot,
      end_time: endTime,
      address: address || '',
      meeting_confirm: 'pending',
      user_id: user_id || null,
    },
    current_prices: {
      advance: String(settings.advancePrice),
      premium: String(settings.premiumPrice),
    },
  });
}));

// ==================== TIME SLOTS ====================

router.get('/time-slots', asyncHandler(async (req, res) => {
  const { date, plan, time_slot } = req.query;

  // Generate time slots in HH:MM:SS format (no end times needed)
  const baseSlots = [];
  for (let h = 11; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 18 && m >= 30) break;
      baseSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`);
    }
  }

  const advanceSlots = baseSlots.slice(0, 13);
  const premiumSlots = ['14:00:00', '17:00:00', '18:00:00', '19:00:00'];
  const maxBookings = { basic: 10, advance: 2, premium: 1 };

  const targetDate = date || new Date().toISOString().split('T')[0];
  const targetPlan = (plan || 'Basic').toLowerCase();
  const theSlots = targetPlan === 'premium' ? premiumSlots : targetPlan === 'advance' ? advanceSlots : baseSlots;

  // Count existing bookings per slot
  const bookings = await Appointment.aggregate([
    { $match: { date: targetDate, selectedPlan: targetPlan, meetingConfirm: { $ne: 'cancelled' } } },
    { $group: { _id: '$timeSlot', count: { $sum: 1 } } },
  ]);
  const bookingCount = {};
  bookings.forEach((b) => { bookingCount[b._id] = b.count; });

  const max = maxBookings[targetPlan] || 10;

  // Return as a flat array of time slot objects (Flutter expects data as List)
  const data = theSlots.map((slot) => {
    const booked = bookingCount[slot] || 0;
    return {
      time: slot,
      available: booked < max ? 1 : 0,
      total: max,
      booked,
      remaining: max - booked,
    };
  });

  // If checking a specific slot
  if (time_slot) {
    const slotData = data.find((s) => s.time === time_slot) || { time: time_slot, available: 1, total: max, booked: 0, remaining: max };
    return res.json({ status: 'success', data: [slotData] });
  }

  res.json({ status: 'success', data });
}));

// ==================== CANCELLED DATES ====================

router.get('/cancelled-dates', asyncHandler(async (req, res) => {
  const dates = await CancelledDate.find().sort({ meetingDate: 1 }).lean();
  res.json({ success: true, dates: dates.map((d) => d.meetingDate) });
}));

// ==================== MEETINGS STATUS ====================

router.get('/meetings/status', asyncHandler(async (req, res) => {
  res.json({
    meetings: {
      online: { status: 'enabled' },
      offline: { status: 'enabled' },
    },
  });
}));

// ==================== PRICING ====================

const sendPrices = async (res) => {
  const MeetingSettings = require('../models/MeetingSettings');
  const settings = await MeetingSettings.getSingleton();
  res.json({ status: 'success', advance: String(settings.advancePrice), premium: String(settings.premiumPrice) });
};

router.get('/pricing', asyncHandler(async (req, res) => sendPrices(res)));
router.get('/prices', asyncHandler(async (req, res) => sendPrices(res)));

// ==================== INSTAGRAM API KEY ====================

router.get('/insta-api-key', asyncHandler(async (req, res) => {
  const ApiKey = require('../models/ApiKey');
  const key = await ApiKey.findOne().sort({ createdAt: -1 }).lean();
  ApiResponse.success(res, { token: key?.key || '' });
}));

// ==================== BANNERS ====================

router.get('/banners', asyncHandler(async (req, res) => {
  const Banner = require('../models/Banner');
  const banners = await Banner.find().sort({ createdAt: -1 }).lean();
  res.json({
    success: true,
    banners: banners.map((b) => ({
      file_path: b.file_path || b.filePath || b.image || b.imageUrl || b.url || b.photo || b.path || b.driveUrl || '',
    })),
  });
}));

// ==================== REVIEWS (SUCCESS STORIES) ====================

router.get('/reviews', asyncHandler(async (req, res) => {
  const Review = require('../models/Review');
  const reviews = await Review.find().sort({ createdAt: -1 }).lean();
  res.json({
    success: true,
    data: reviews.map((r) => ({
      user_name: r.user_name || r.title || r.name || 'Anonymous',
      visa_type: r.visa_type || r.subtitle || r.visa || 'Visa',
      rating: String(r.rating ?? r.stars ?? 5.0),
      story: r.story || r.description || r.desc || r.content || '',
      user_image: avatarUrl(r.user_image || r.imageUrl || r.image || r.photo || ''),
    })),
  });
}));

// ==================== WEBRTC TURN CREDENTIALS ====================

let cachedTurnServers = null;
let cachedTurnExpiresAt = 0;

const fetchTurnServers = async () => {
  const now = Date.now();
  if (cachedTurnServers && cachedTurnExpiresAt > now) {
    return cachedTurnServers;
  }
  if (!config.metered || !config.metered.apiKey) {
    throw new Error('TURN server not configured');
  }
  const appName = config.metered.appName || 'avisaexperts';
  const url = `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${config.metered.apiKey}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to fetch TURN credentials: ${response.status}`);
  const servers = await response.json();
  if (!Array.isArray(servers) || servers.length === 0) {
    throw new Error('Invalid TURN credentials response');
  }
  cachedTurnServers = servers;
  cachedTurnExpiresAt = now + 4 * 60 * 1000;
  return cachedTurnServers;
};

router.get('/turn-credentials', asyncHandler(async (req, res) => {
  try {
    const servers = await fetchTurnServers();
    res.json({ success: true, servers });
  } catch (err) {
    console.error('[TURN] Error fetching credentials:', err.message);
    res.json({ success: false, message: err.message, servers: [] });
  }
}));

// ==================== CHAT ENDPOINTS (Flutter app compat) ====================

// Get messages between two users (like PHP getMessages.php)
router.get('/chat/messages', asyncHandler(async (req, res) => {
  const { sender_id, receiver_id } = req.query;
  if (!sender_id || !receiver_id) {
    return res.json({ success: false, message: 'sender_id and receiver_id required', data: [] });
  }

  const Message = require('../models/Message');
  const Conversation = require('../models/Conversation');

  const sId = await resolveId(sender_id);
  const rId = await resolveId(receiver_id);
  if (!sId || !rId) {
    return res.json({ success: false, message: 'Invalid sender_id or receiver_id', data: [] });
  }

  // Find the conversation between these two users
  const conv = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [sId, rId], $size: 2 },
  });

  if (!conv) return res.json({ success: true, data: [] });

  const messages = await Message.find({ conversation: conv._id })
    .sort({ createdAt: 1 })
    .lean();

  const data = messages.map((m) => ({
    id: m._id,
    sender_id: m.sender?.toString(),
    receiver_id: m.recipient?.toString(),
    message: m.content,
    type: m.type,
    file_path: m.fileUrl || '',
    file_type: m.mimeType || '',
    status: m.status,
    is_read: m.status === 'seen' ? 'Yes' : 'No',
    created_at: m.createdAt,
    reply_to_id: m.replyTo?.toString() || null,
  }));

  res.json({ success: true, data, messages: data, conversation: { id: conv._id, freeUntil: conv.freeUntil, isPaid: conv.isPaid, paymentAmount: conv.paymentAmount, lockedToAgent: conv.lockedToAgent?.toString() || null, participants: conv.participants.map((p) => p.toString()), isActive: conv.isActive } });
}));

// Send a message (like PHP sendMessage.php)
router.post('/chat/send', multerUpload.single('file'), handleMulterError, asyncHandler(async (req, res) => {
  const { sender_id, receiver_id, message, file_path, file_type, file_name, file_size, reply_to_id } = req.body;
  if (!sender_id || !receiver_id || !message) {
    return res.json({ success: false, message: 'sender_id, receiver_id, message required' });
  }

  const Message = require('../models/Message');
  const Conversation = require('../models/Conversation');

  const sId = await resolveId(sender_id);
  const rId = await resolveId(receiver_id);
  if (!sId || !rId) {
    return res.json({ success: false, message: 'Invalid sender_id or receiver_id' });
  }

  // Find or create conversation
  let conv = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [sId, rId], $size: 2 },
  });

  if (!conv) {
    conv = await Conversation.create({
      type: 'direct',
      participants: [sId, rId],
      isActive: true,
    });
  }

  // Handle file upload (app sends the binary in the `file` field)
  let fileUrl = file_path || '';
  let finalFileName = file_name || '';
  let finalFileSize = file_size || '';
  let finalMimeType = file_type || '';
  let filePublicId = null;
  if (req.file) {
    const originalName = req.file.originalname || finalFileName || 'file';
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(originalName);
    if (config.cloudinary.cloudName) {
      const cloudResult = await uploadToCloudinary(req.file.path, {
        folder: 'voicecall/chat',
        resourceType: isImage ? 'image' : 'auto',
      });
      fileUrl = cloudResult.url;
      filePublicId = cloudResult.publicId;
    } else {
      fileUrl = `${config.serverUrl}/uploads/files/${req.file.filename}`;
      filePublicId = req.file.filename;
    }
    finalFileName = originalName;
    finalFileSize = req.file.size || finalFileSize;
    finalMimeType = req.file.mimetype || finalMimeType;
  }

  const replyToId = reply_to_id ? await resolveId(reply_to_id) : null;

  const msg = await Message.create({
    conversation: conv._id,
    sender: sId,
    recipient: rId,
    type: fileUrl ? 'file' : 'text',
    content: message || '',
    fileUrl: fileUrl || undefined,
    fileName: finalFileName || undefined,
    fileSize: finalFileSize || undefined,
    mimeType: finalMimeType || undefined,
    filePublicId: filePublicId || undefined,
    replyTo: replyToId || undefined,
    status: 'sent',
    'statusTimestamps.sent': new Date(),
  });

  // Update conversation
  conv.lastMessage = msg._id;
  const unreadEntry = conv.unreadCount.find((u) => u.user.toString() === rId.toString());
  if (unreadEntry) unreadEntry.count += 1;
  else conv.unreadCount.push({ user: rId, count: 1 });
  await conv.save();

  // Populate replyTo so clients receive the quoted text in real-time
  if (msg.replyTo) {
    await msg.populate('replyTo');
  }

  // Emit socket event for real-time
  if (req.io) {
    const msgObj = msg.toObject();
    msgObj.sender = { _id: sId };
    req.io.to(`user:${rId}`).emit('message:new', msgObj);
    req.io.to(`user:${sId}`).emit('message:new', msgObj);

    // Also emit conversation update so sidebar refreshes in real-time
    req.io.to(`user:${rId}`).emit('conversation:updated', {
      conversationId: conv._id.toString(),
      lastMessage: message?.substring(0, 100) || '',
      lastMessageAt: msg.createdAt,
      senderId: sId.toString(),
    });
    req.io.to(`user:${sId}`).emit('conversation:updated', {
      conversationId: conv._id.toString(),
      lastMessage: message?.substring(0, 100) || '',
      lastMessageAt: msg.createdAt,
      senderId: sId.toString(),
    });
  }

  // Send push notification to the recipient's devices
  const sender = await getAccountById(sId, 'displayName username');
  notifyMessageReceived({
    recipientId: rId,
    sender,
    message: msg,
    conversationId: conv._id,
  }).catch((err) => console.error('[MessageNotification] push failed:', err.message));

  res.json({ success: true, message_id: msg._id, created_at: msg.createdAt, fileUrl });
}));

// Get users that have a chat history with the given agent/consultant
// (like PHP getUsersAllData.php)
router.get('/users-all-data', asyncHandler(async (req, res) => {
  const { id } = req.query;
  if (!id) return res.json({ success: true, data: [], pagination: { current_page: 1, total_pages: 1, total_records: 0 } });

  const agentOid = await resolveId(id);
  if (!agentOid) return res.json({ success: true, data: [], pagination: { current_page: 1, total_pages: 1, total_records: 0 } });

  const Message = require('../models/Message');
  const Conversation = require('../models/Conversation');

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const baseFilter = { type: 'direct', participants: agentOid };
  const total = await Conversation.countDocuments(baseFilter);
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

  // Find all direct conversations where the agent participates
  const conversations = await Conversation.find(baseFilter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('lastMessage', 'createdAt')
    .lean();

  if (!conversations.length) {
    return res.json({
      success: true,
      data: [],
      pagination: { current_page: page, total_pages: totalPages, total_records: total },
    });
  }

  const otherParticipantIds = conversations
    .map((c) => c.participants.find((p) => p.toString() !== agentOid.toString()))
    .filter(Boolean);

  if (!otherParticipantIds.length) return res.json({ success: true, data: [] });

  const users = await User.find({ _id: { $in: otherParticipantIds } })
    .select('displayName username email mobile status avatar sqlId')
    .lean();

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  // Batch count unread messages per conversation
  const conversationIds = conversations.map((c) => c._id);
  const unreadByConversation = new Map();
  const userObjectIds = users.map((u) => u._id);
  if (conversationIds.length && userObjectIds.length) {
    const unreadAgg = await Message.aggregate([
      {
        $match: {
          conversation: { $in: conversationIds },
          sender: { $in: userObjectIds },
          recipient: agentOid,
          status: { $nin: ['seen', 'read'] },
        },
      },
      { $group: { _id: '$conversation', count: { $sum: 1 } } },
    ]);
    unreadAgg.forEach((item) => unreadByConversation.set(item._id.toString(), item.count));
  }

  const result = [];
  for (const conv of conversations) {
    const otherParticipantId = conv.participants.find((p) => p.toString() !== agentOid.toString());
    if (!otherParticipantId) continue;
    const user = userMap.get(otherParticipantId.toString());
    if (!user) continue;

    const lastMessageTime = conv.lastMessage?.createdAt || conv.updatedAt || null;
    const unreadCount = unreadByConversation.get(conv._id.toString()) || 0;

    const agentProfile = avatarUrl(user.avatar);

    result.push({
      id: user.sqlId ? user.sqlId.toString() : user._id.toString(),
      user_name: user.displayName || user.username || 'User',
      user_email: user.email || '',
      user_mobile: user.mobile?.toString() || '',
      user_current_status: user.status === 'online' ? 'Active' : 'Unavailable',
      user_role: 'User',
      form_submitted: 'No',
      user_profile: agentProfile,
      total_order: 0,
      count_status: unreadCount,
      last_message_time: lastMessageTime ? new Date(lastMessageTime).toISOString() : '',
    });
  }

  // Sort by latest message time descending
  result.sort((a, b) => {
    const ta = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
    const tb = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
    return tb - ta;
  });

  res.json({
    success: true,
    data: result,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_records: total,
    },
  });
}));

// ==================== BLOG POSTS ====================

router.get('/posts', asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;
  const filter = { status: 'published' };
  if (category && category !== 'All') {
    filter.category = category;
  }
  if (search) {
    filter.$text = { $search: search };
  }
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .lean();
  const total = await Post.countDocuments(filter);
  res.json({
    success: true,
    data: posts,
    total,
    page: parseInt(page, 10),
    pages: Math.ceil(total / parseInt(limit, 10)),
  });
}));

router.get('/posts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  let post;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    post = await Post.findById(id).lean();
  }
  if (!post) {
    post = await Post.findOne({ legacyId: parseInt(id, 10) }).lean();
  }
  if (!post) {
    throw new AppError('Post not found', 404);
  }
  // Increment clicks
  await Post.findByIdAndUpdate(post._id, { $inc: { clicks: 1 } });
  res.json({ success: true, data: post });
}));

router.get('/posts/:id/related', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const current = await Post.findById(id).lean() || await Post.findOne({ legacyId: parseInt(id, 10) }).lean();
  if (!current) {
    throw new AppError('Post not found', 404);
  }
  const related = await Post.find({
    _id: { $ne: current._id },
    status: 'published',
    category: current.category,
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();
  res.json({ success: true, data: related });
}));

// ==================== WALLET ====================

router.get('/wallet', asyncHandler(async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) throw new AppError('user_id is required', 400);
  const oid = await resolveId(user_id);
  const user = oid ? await User.findById(oid).select('walletBalance username displayName email') : null;
  if (!user) throw new AppError('User not found', 404);

  // Auto-add ₹40 pre-recharge for users with 0 balance (reversible)
  if ((user.walletBalance || 0) <= 0) {
    user.walletBalance = 40;
    await user.save();
  }

  const Transaction = require('../models/Transaction');
  const transactions = await Transaction.find({ user: oid }).sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, balance: user.walletBalance, user: { username: user.username, displayName: user.displayName, email: user.email }, transactions, preRechargeNote: '₹40 pre-recharge added' });
}));

router.post('/wallet/reset-balance', asyncHandler(async (req, res) => {
  // Reset ALL users' wallet balance to 0 (reversible)
  await User.updateMany({ role: 'user' }, { walletBalance: 0 });
  res.json({ success: true, message: 'All user wallet balances reset to 0' });
}));

// ==================== CHAT CONVERSATION / GREET / PAY ====================

const getGreetingByIST = () => {
  const now = new Date();
  const istHour = parseInt(now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }), 10);
  if (istHour >= 5 && istHour < 12) return 'Good morning';
  if (istHour >= 12 && istHour < 16) return 'Good afternoon';
  if (istHour >= 16 && istHour < 21) return 'Good evening';
  return 'Hello';
};

const isAgentRole = (role) => ['agent', 'case_manager', 'manager', 'senior_manager', 'admin'].includes(role);

router.post('/chat/conversation', asyncHandler(async (req, res) => {
  const { sender_id, receiver_id } = req.body;
  if (!sender_id || !receiver_id) throw new AppError('sender_id and receiver_id are required', 400);
  const Conversation = require('../models/Conversation');
  const { getAccountById } = require('../utils/account');
  const sId = await resolveId(sender_id);
  const rId = await resolveId(receiver_id);
  if (!sId || !rId) throw new AppError('Invalid sender_id or receiver_id', 400);
  const sender = await getAccountById(sId, 'role blockedUsers');
  const receiver = await getAccountById(rId, 'role blockedUsers');
  if (!sender || !receiver) throw new AppError('User not found', 404);
  const isUserToAgent = sender.role === 'user' && isAgentRole(receiver.role);
  let conv = await Conversation.findOne({ type: 'direct', participants: { $all: [sId, rId], $size: 2 } });
  const isNewConversation = !conv;
  const chatSettings = await getChatSettings();

  // Check if the user has already used their one free trial with ANY agent
  const hasUsedFreeTrial = isUserToAgent ? await Conversation.findOne({
    participants: sId,
    lockedToAgent: { $exists: true, $ne: null },
  }) : null;

  if (!conv) {
    const d = { type: 'direct', participants: [sId, rId] };
    // Only give free trial if user hasn't already had one with any agent (unless admin enabled unlimited)
    if (isUserToAgent) {
      d.lockedToAgent = rId;
      d.isPaid = false;
      d.paymentAmount = chatSettings.chatPaymentAmount;
      d.notified50 = false;
      d.notified90 = false;
      if (chatSettings.unlimitedFreeChat) {
        d.freeUntil = FAR_FUTURE;
      } else if (!hasUsedFreeTrial) {
        d.freeUntil = new Date(Date.now() + chatSettings.freeChatDurationSeconds * 1000);
      }
    }
    conv = await Conversation.create(d);
  }

  // If this is an existing conversation that never got a free trial
  // (e.g., old chat before free trial logic was added), check global usage
  if (conv && isUserToAgent && !conv.lockedToAgent) {
    conv.lockedToAgent = rId;
    conv.notified50 = false;
    conv.notified90 = false;
    conv.isPaid = false;
    conv.paymentAmount = chatSettings.chatPaymentAmount;
    if (chatSettings.unlimitedFreeChat) {
      conv.freeUntil = FAR_FUTURE;
    } else if (!hasUsedFreeTrial) {
      conv.freeUntil = new Date(Date.now() + chatSettings.freeChatDurationSeconds * 1000);
    }
    await conv.save();
  }

  // Build participant data with names for the frontend
  const participantData = [
    { _id: sender._id?.toString() || sender_id, displayName: sender.displayName || sender.username || null, username: sender.username || 'Unknown', avatar: avatarUrl(sender.avatar) },
    { _id: receiver._id?.toString() || receiver_id, displayName: receiver.displayName || receiver.username || null, username: receiver.username || 'Unknown', avatar: avatarUrl(receiver.avatar) },
  ];

  const convData = { id: conv._id, _id: conv._id, freeUntil: conv.freeUntil, isPaid: conv.isPaid, paymentAmount: conv.paymentAmount, lockedToAgent: conv.lockedToAgent?.toString() || null, participants: participantData, isActive: conv.isActive, updatedAt: conv.updatedAt || new Date() };

  // Emit real-time socket events
  if (req.io) {
    const sIdStr = sId.toString();
    const rIdStr = rId.toString();
    if (!isNewConversation) {
      // Existing conversation – just notify the update
      req.io.to(`user:${sIdStr}`).emit('conversation:updated', { conversationId: conv._id.toString(), ...convData });
      req.io.to(`user:${rIdStr}`).emit('conversation:updated', { conversationId: conv._id.toString(), ...convData });
    } else {
      // New conversation – notify both participants so the sidebar updates in real-time
      req.io.to(`user:${sIdStr}`).emit('conversation:new', convData);
      req.io.to(`user:${rIdStr}`).emit('conversation:new', convData);
    }
  }

  res.json({ success: true, conversation: convData });
}));

router.post('/chat/greet', asyncHandler(async (req, res) => {
  const { sender_id, receiver_id } = req.body;
  if (!sender_id || !receiver_id) return res.json({ success: false, message: 'sender_id and receiver_id are required' });
  const Conversation = require('../models/Conversation');
  const Message = require('../models/Message');
  const sId = await resolveId(sender_id);
  const rId = await resolveId(receiver_id);
  if (!sId || !rId) return res.json({ success: false, message: 'Invalid sender_id or receiver_id' });
  const conv = await Conversation.findOne({ type: 'direct', participants: { $all: [sId, rId], $size: 2 } });
  if (!conv) return res.json({ success: false, message: 'Conversation not found' });
  if (conv.greetingSent) return res.json({ success: true, greeting: null, message: 'Greeting already sent' });
  const other = conv.participants.find((p) => p.toString() !== sId.toString());
  if (!other) return res.json({ success: false, message: 'No other participant found' });
  const greeting = getGreetingByIST();
  const message = await Message.create({
    conversation: conv._id, sender: other, recipient: sId,
    type: 'text', content: `${greeting}! How can I help you today?`,
    status: 'sent', 'statusTimestamps.sent': new Date(), isSystemMessage: false,
  });
  conv.greetingSent = true; conv.lastMessage = message._id; await conv.save();
  if (req.io) { req.io.to(`user:${sId}`).emit('message:new', { ...message.toObject(), sender: { _id: other } }); }
  res.json({ success: true, greeting: { id: message._id, sender_id: other.toString(), receiver_id: sId.toString(), message: message.content, type: 'text', file_path: '', file_type: '', status: 'sent', is_read: 'No', created_at: message.createdAt } });
}));

router.post('/chat/pay', asyncHandler(async (req, res) => {
  const { sender_id, receiver_id } = req.body;
  if (!sender_id || !receiver_id) throw new AppError('sender_id and receiver_id are required', 400);
  const Conversation = require('../models/Conversation');
  const sId = await resolveId(sender_id);
  const rId = await resolveId(receiver_id);
  if (!sId || !rId) throw new AppError('Invalid sender_id or receiver_id', 400);
  const user = await User.findById(sId);
  if (!user) throw new AppError('User not found', 404);
  const conv = await Conversation.findOne({ type: 'direct', participants: { $all: [sId, rId], $size: 2 } });
  if (!conv) throw new AppError('Conversation not found', 404);
  const amount = conv.paymentAmount || config.chatPaymentAmount || 100;
  if ((user.walletBalance || 0) < amount) throw new AppError('Insufficient wallet balance', 402);
  user.walletBalance -= amount; await user.save();
  conv.isPaid = true; conv.freeUntil = null; await conv.save();

  // Emit real-time updates
  if (req.io) {
    const sIdStr = sId.toString();
    const rIdStr = rId.toString();
    // Notify agent that the conversation status changed
    req.io.to(`user:${rIdStr}`).emit('conversation:updated', {
      conversationId: conv._id.toString(),
      isPaid: true,
      freeUntil: null,
      paymentAmount: amount,
    });
    // Update wallet balance for the client
    req.io.to(`user:${sIdStr}`).emit('wallet:updated', {
      balance: user.walletBalance,
    });
  }

  res.json({ success: true, conversation: { id: conv._id, isPaid: true, freeUntil: null, paymentAmount: amount }, newBalance: user.walletBalance });
}));

// ==================== DIAGNOSTICS ====================

router.get('/agent-status', asyncHandler(async (req, res) => {
  const { agent_id } = req.query;
  if (!agent_id) throw new AppError('agent_id is required', 400);

  const { getAccountById } = require('../utils/account');
  const account = await getAccountById(agent_id, 'status workStatus lastSeen');
  if (!account) return res.json({ success: false, message: 'Agent not found' });

  // Check if the agent has an active socket connection
  const io = req.io;
  if (!io) return res.json({ success: false, message: 'Socket not initialized' });

  const userId = account._id.toString();
  const agentInRoom = io.sockets.adapter.rooms.has(`user:${userId}`);
  const socketCount = io.sockets.adapter.rooms.get(`user:${userId}`)?.size || 0;

  res.json({
    success: true,
    agent: {
      id: userId,
      accountType: account.accountType,
      status: account.status,
      workStatus: account.workStatus,
      lastSeen: account.lastSeen,
    },
    online: {
      inSocketRoom: agentInRoom,
      socketCount,
      hasActiveSocket: socketCount > 0,
    },
    timestamp: new Date(),
  });
}));

// ==================== ONLINE AGENTS ====================

router.get('/online-agents', asyncHandler(async (req, res) => {
  const io = req.io;
  if (!io) return res.json({ success: false, message: 'Socket not initialized' });

  const Employee = require('../models/Employee');
  const rooms = io.sockets.adapter.rooms;
  const onlineIds = [];

  for (const [roomName, sockets] of rooms.entries()) {
    if (roomName.startsWith('user:') && sockets.size > 0) {
      onlineIds.push(roomName.replace('user:', ''));
    }
  }

  const employees = await Employee.find({
    _id: { $in: onlineIds },
  }).select('displayName username avatar callRate').lean();

  res.json({
    success: true,
    agents: employees.map((e) => ({
      id: e._id.toString(),
      name: e.displayName || e.username,
      avatar: avatarUrl(e.avatar),
      callRate: e.callRate || 0,
    })),
  });
}));

// ==================== SOCKET TEST ====================

router.post('/socket-test', asyncHandler(async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) throw new AppError('user_id is required', 400);

  const io = req.io;
  if (!io) throw new AppError('Socket not initialized', 500);

  const roomName = `user:${user_id}`;
  const room = io.sockets.adapter.rooms.get(roomName);
  const socketCount = room ? room.size : 0;

  // Emit a test event to the user's room
  io.to(roomName).emit('socket:test', { message: 'Socket test from server', timestamp: new Date() });

  res.json({
    success: true,
    message: 'Test event emitted',
    roomName,
    socketCount,
    userId: user_id,
  });
}));

// ==================== CALL DEBUG ====================

router.post('/call-debug', asyncHandler(async (req, res) => {
  const { agent_id } = req.body;
  if (!agent_id) throw new AppError('agent_id is required', 400);

  const io = req.io;
  if (!io) throw new AppError('Socket not initialized', 500);

  const roomName = `user:${agent_id}`;
  const room = io.sockets.adapter.rooms.get(roomName);
  const socketCount = room ? room.size : 0;

  // Emit a test call:incoming event to the agent's room
  io.to(roomName).emit('call:incoming', {
    call: { _id: 'test-call-123', type: 'audio', status: 'ringing' },
    caller: { displayName: 'Test Caller', username: 'test' },
    roomId: `call:test-call-123`,
  });

  res.json({
    success: true,
    message: 'Test call:incoming emitted',
    roomName,
    socketCount,
    agentId: agent_id,
  });
}));

// ==================== CALL INITIATE (REST) ====================

router.post('/call/initiate', asyncHandler(async (req, res) => {
  const { sender_id, receiver_id, type = 'audio', offer } = req.body;
  if (!sender_id || !receiver_id) {
    throw new AppError('sender_id and receiver_id are required', 400);
  }

  const Call = require('../models/Call');
  const { getAccountById } = require('../utils/account');
  const callBilling = require('../services/callBillingService');
  const mongoose = require('mongoose');
  const io = req.io;
  if (!io) throw new AppError('Socket not initialized', 500);

  console.log(`[Call:REST] ${sender_id} initiating call to ${receiver_id}`);

  const [receiverAccount, callerAccount] = await Promise.all([
    getAccountById(receiver_id, 'blockedUsers callRate username displayName avatar'),
    getAccountById(sender_id, 'username displayName avatar blockedUsers walletBalance'),
  ]);

  if (!receiverAccount) throw new AppError('Receiver not found', 404);
  if (!callerAccount) throw new AppError('Sender not found', 404);

  // Check if receiver is blocked
  const receiverBlocked = (receiverAccount.blockedUsers || []).map((id) => id.toString());
  const callerBlocked = (callerAccount.blockedUsers || []).map((id) => id.toString());
  if (receiverBlocked.includes(sender_id) || callerBlocked.includes(receiver_id)) {
    throw new AppError('Cannot call this user', 403);
  }

  // Check wallet balance
  const ratePerMinute = callBilling.getEffectiveRate(receiverAccount, receiverAccount.callRate);
  if (ratePerMinute > 0 && !(await callBilling.hasSufficientBalance(sender_id, ratePerMinute))) {
    throw new AppError('Insufficient balance to start this call', 402);
  }

  const callData = {
    caller: new mongoose.Types.ObjectId(sender_id),
    receiver: new mongoose.Types.ObjectId(receiver_id),
    type: type || 'audio',
    status: 'ringing',
    ratePerMinute,
  };
  if (offer) {
    callData.signalData = { offer: { type: offer.type, sdp: offer.sdp } };
  }
  const call = await Call.create(callData);

  console.log(`[Call:REST] Call created: ${call._id}`);

  const roomId = `call:${call._id}`;

  // Emit call:incoming to receiver
  const callerInfo = {
    _id: callerAccount._id.toString(),
    displayName: callerAccount.displayName || callerAccount.username,
    username: callerAccount.username,
    avatar: callerAccount.avatar,
  };

  io.to(`user:${receiver_id}`).emit('call:incoming', {
    call: {
      _id: call._id.toString(),
      caller: { _id: sender_id },
      receiver: { _id: receiver_id },
      type: type || 'audio',
      status: 'ringing',
      ratePerMinute,
      signalData: call.signalData,
      createdAt: call.createdAt,
    },
    caller: callerInfo,
    roomId,
  });

  console.log(`[Call:REST] call:incoming emitted to user:${receiver_id}`);

  // Emit call:ringing to caller
  io.to(`user:${sender_id}`).emit('call:ringing', {
    call: {
      _id: call._id.toString(),
      caller: { _id: sender_id },
      receiver: { _id: receiver_id },
      type: type || 'audio',
      status: 'ringing',
      ratePerMinute,
      createdAt: call.createdAt,
    },
    roomId,
  });

  console.log(`[Call:REST] call:ringing emitted to user:${sender_id}`);

  res.json({
    success: true,
    callId: call._id.toString(),
    roomId,
    ratePerMinute,
  });
}));

module.exports = router;
