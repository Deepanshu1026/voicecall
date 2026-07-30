const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const OtpVerification = require('../models/OtpVerification');
const CancelledDate = require('../models/CancelledDate');
const Post = require('../models/Post');
const { generateTokens } = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/ApiResponse');

// ==================== AUTH ====================

// Mobile app login (email or phone)
router.post('/login', asyncHandler(async (req, res) => {
  const { login_input, password, country_code } = req.body;
  if (!login_input || !password) {
    throw new AppError('Login input and password are required', 400);
  }

  let user;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login_input)) {
    user = await User.findOne({ email: login_input.toLowerCase().trim(), role: 'user' });
  } else if (/^\d+$/.test(login_input)) {
    if (!country_code) throw new AppError('Country code is required for phone login', 400);
    user = await User.findOne({ mobile: login_input.trim(), role: 'user' });
  } else {
    throw new AppError('Please provide a valid email or phone number', 400);
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid credentials', 401);
  }
  if (user.status === 'offline' || user.status === 'away') {
    throw new AppError('Account is disabled', 403);
  }

  const tokens = generateTokens(user._id);
  await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken, lastSeen: new Date() });

  ApiResponse.success(res, {
    user_id: user._id,
    name: user.displayName || user.username,
    email: user.email,
    phone: user.mobile,
    user_profile: user.avatar?.url || user.avatar || '',
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
    user_profile: a.avatar || '',
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
      user_profile: user.avatar?.url || user.avatar || '',
    },
  });
}));

router.post('/edit-profile', asyncHandler(async (req, res) => {
  const { userid, name, contact, email } = req.body;
  if (!userid || !name || !contact || !email) {
    throw new AppError('userid, name, contact, email are required', 400);
  }

  const update = { displayName: name.trim(), mobile: contact.trim(), email: email.toLowerCase().trim() };

  // Handle file upload for profile picture (if implemented)
  if (req.file) {
    // Upload to Cloudinary and set update.avatar
  }

  await User.findByIdAndUpdate(userid, update);

  const user = await User.findById(userid).select('displayName username email mobile avatar');
  ApiResponse.success(res, {
    userid,
    name: user.displayName,
    contact: user.mobile,
    email: user.email,
    profile_url: user.avatar?.url || user.avatar || '',
  }, 'Profile updated');
}));

// ==================== MESSAGES / INBOX ====================

router.get('/inbox', asyncHandler(async (req, res) => {
  const { receiver_id } = req.query;
  if (!receiver_id) throw new AppError('receiver_id is required', 400);

  const Message = require('../models/Message');
  const mongoose = require('mongoose');
  const receiverOid = new mongoose.Types.ObjectId(receiver_id);

  // Find all conversations where the user is a participant
  const Conversation = require('../models/Conversation');
  const conversations = await Conversation.find({ participants: receiverOid, type: 'direct' }).lean();

  const inbox = [];
  let totalUnread = 0;

  for (const conv of conversations) {
    const otherParticipant = conv.participants.find((p) => p.toString() !== receiver_id);
    if (!otherParticipant) continue;

    // Get other participant details
    let other = await User.findById(otherParticipant).select('displayName username avatar workStatus status').lean();
    if (!other) other = await Employee.findById(otherParticipant).select('displayName username avatar workStatus status').lean();
    if (!other) continue;

    // Get last message
    const lastMsg = await Message.findOne({ conversation: conv._id }).sort({ createdAt: -1 }).lean();
    if (!lastMsg) continue;

    const isFromMe = lastMsg.sender?.toString() === receiver_id;
    const unreadCount = (conv.unreadCount || []).find((u) => u.user?.toString() === receiver_id)?.count || 0;
    totalUnread += unreadCount;

    inbox.push({
      agent_id: otherParticipant,
      agent_name: other.displayName || other.username || 'Unknown',
      agent_profile: other.avatar?.url || other.avatar || '',
      user_current_status: other.workStatus || other.status || 'Unavailable',
      last_message: lastMsg.content || (lastMsg.type === 'file' ? '📎 File' : ''),
      created_at: lastMsg.createdAt,
      last_message_type: isFromMe ? 'sent' : 'received',
      last_message_read_status: lastMsg.status || 'sent',
      unread_count: unreadCount,
      has_unread_messages: unreadCount > 0,
      is_last_message_from_me: isFromMe,
    });
  }

  inbox.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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

// ==================== NOTIFICATIONS ====================

router.get('/notifications', asyncHandler(async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).lean();
  const data = notifications.map((n) => ({
    title: n.title,
    message: n.message,
    media_path: n.mediaPath,
    date: n.createdAt ? new Date(n.createdAt).toISOString().split('T')[0] : '',
    time: n.createdAt ? new Date(n.createdAt).toTimeString().split(' ')[0] : '',
  }));
  res.json({ success: true, notifications: data });
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

  const appointment = await Appointment.create({
    userId: user_id || null,
    name: name.trim(),
    email: email.trim(),
    contact: contact.trim(),
    address: address || '',
    query: querry || '',
    mode,
    date: datetime.split(' ')[0] || '',
    selectedPlan: selected_plan,
    timeSlot: time_slot,
    referenceId: refId,
    datetime,
    meetingConfirm: 'pending',
  });

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
      start_time: time_slot.split('-')[0]?.trim() || time_slot,
      end_time: time_slot.split('-')[1]?.trim() || time_slot,
      address: address || '',
      meeting_confirm: 'pending',
      user_id: user_id || null,
    },
    current_prices: { advance: '1180', premium: '1770' },
  });
}));

// ==================== TIME SLOTS ====================

router.get('/time-slots', asyncHandler(async (req, res) => {
  const { date, plan, time_slot, all_available } = req.query;

  const baseSlots = [];
  for (let h = 11; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 18 && m === 30) break;
      const start = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const endM = m + 30 >= 60 ? 0 : m + 30;
      const endH = m + 30 >= 60 ? h + 1 : h;
      if (endH > 18) break;
      const end = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
      baseSlots.push(`${start}-${end}`);
    }
  }

  const advanceSlots = baseSlots.slice(0, 13);
  const premiumSlots = ['14:00-14:30', '17:00-17:30', '18:00-18:30', '19:00-19:30'];
  const maxBookings = { basic: 10, advance: 2, premium: 1 };

  const targetDate = date || new Date().toISOString().split('T')[0];
  const targetPlan = plan || 'basic';
  const theSlots = targetPlan === 'premium' ? premiumSlots : targetPlan === 'advance' ? advanceSlots : baseSlots;

  // Count existing bookings per slot
  const bookings = await Appointment.aggregate([
    { $match: { date: targetDate, selectedPlan: targetPlan, meetingConfirm: { $ne: 'cancelled' } } },
    { $group: { _id: '$timeSlot', count: { $sum: 1 } } },
  ]);
  const bookingCount = {};
  bookings.forEach((b) => { bookingCount[b._id] = b.count; });

  if (time_slot) {
    // Check single slot
    const count = bookingCount[time_slot] || 0;
    const max = maxBookings[targetPlan] || 10;
    return res.json({
      status: 'success',
      data: { available: count < max, booked: count, max },
    });
  }

  const slotData = {};
  for (const slot of theSlots) {
    const count = bookingCount[slot] || 0;
    const max = maxBookings[targetPlan] || 10;
    slotData[slot] = { available: count < max, booked: count, max };
  }

  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    data: all_available ? slotData : { slots: theSlots, availability: slotData },
  });
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

router.get('/pricing', asyncHandler(async (req, res) => {
  res.json({ advance: '1180', premium: '1770' });
}));

// ==================== INSTAGRAM API KEY ====================

router.get('/insta-api-key', asyncHandler(async (req, res) => {
  const ApiKey = require('../models/ApiKey');
  const key = await ApiKey.findOne().sort({ createdAt: -1 }).lean();
  res.json({ status: true, data: key ? [key] : [] });
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
  const mongoose = require('mongoose');

  const sId = new mongoose.Types.ObjectId(sender_id);
  const rId = new mongoose.Types.ObjectId(receiver_id);

  // Find the conversation between these two users
  const conv = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [sId, rId], $size: 2 },
  });

  if (!conv) return res.json({ success: true, data: [] });

  const messages = await Message.find({ conversation: conv._id })
    .sort({ createdAt: -1 })
    .limit(100)
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

  res.json({ success: true, data });
}));

// Send a message (like PHP sendMessage.php)
router.post('/chat/send', asyncHandler(async (req, res) => {
  const { sender_id, receiver_id, message, file_path, file_type } = req.body;
  if (!sender_id || !receiver_id || !message) {
    return res.json({ success: false, message: 'sender_id, receiver_id, message required' });
  }

  const Message = require('../models/Message');
  const Conversation = require('../models/Conversation');
  const mongoose = require('mongoose');

  const sId = new mongoose.Types.ObjectId(sender_id);
  const rId = new mongoose.Types.ObjectId(receiver_id);

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

  const msg = await Message.create({
    conversation: conv._id,
    sender: sId,
    recipient: rId,
    type: file_path ? 'file' : 'text',
    content: message || '',
    fileUrl: file_path || undefined,
    mimeType: file_type || undefined,
    status: 'sent',
    'statusTimestamps.sent': new Date(),
  });

  // Update conversation
  conv.lastMessage = msg._id;
  const unreadEntry = conv.unreadCount.find((u) => u.user.toString() === rId.toString());
  if (unreadEntry) unreadEntry.count += 1;
  else conv.unreadCount.push({ user: rId, count: 1 });
  await conv.save();

  // Emit socket event for real-time
  if (req.io) {
    const msgObj = msg.toObject();
    msgObj.sender = { _id: sId };
    req.io.to(`user:${rId}`).emit('message:new', msgObj);
    req.io.to(`user:${sId}`).emit('message:new', msgObj);
  }

  res.json({ success: true, message_id: msg._id, created_at: msg.createdAt });
}));

// Get users data (like PHP getusersAllData.php)
router.get('/users-all-data', asyncHandler(async (req, res) => {
  const { id } = req.query;
  const filter = id ? { _id: id } : {};
  const users = await User.find(filter).select('-password -refreshToken').lean();
  res.json({ success: true, data: users });
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

module.exports = router;
