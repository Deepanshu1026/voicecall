const User = require('../models/User');
const Employee = require('../models/Employee');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');
const { getAccountById, getAccountDocumentById } = require('../utils/account');

const searchUsers = asyncHandler(async (req, res) => {
  const { query, page = 1, limit = 20 } = req.query;

  if (!query || query.trim().length < 2) {
    return ApiResponse.success(res, [], 'Enter at least 2 characters to search');
  }

  const searchRegex = new RegExp(query.trim(), 'i');
  const users = await User.find({
    _id: { $ne: req.userId },
    $and: [
      { blockedUsers: { $ne: req.userId } },
      { _id: { $nin: req.user.blockedUsers } },
    ],
    $or: [
      { username: searchRegex },
      { displayName: searchRegex },
      { email: searchRegex },
    ],
  })
    .select('username displayName avatar status lastSeen bio')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await User.countDocuments({
    _id: { $ne: req.userId },
    $and: [
      { blockedUsers: { $ne: req.userId } },
      { _id: { $nin: req.user.blockedUsers } },
    ],
    $or: [
      { username: searchRegex },
      { displayName: searchRegex },
      { email: searchRegex },
    ],
  });

  ApiResponse.paginated(res, users, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
  });
});

const getContacts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).populate({
    path: 'contacts.user',
    select: 'username displayName avatar status lastSeen bio',
  });

  const contacts = (user.contacts || []).map((contact) => ({
    _id: contact.user?._id,
    username: contact.user?.username,
    displayName: contact.user?.displayName,
    avatar: contact.user?.avatar,
    status: contact.user?.status,
    lastSeen: contact.user?.lastSeen,
    bio: contact.user?.bio,
    nickname: contact.nickname,
    addedAt: contact.addedAt,
  }));

  ApiResponse.success(res, contacts);
});

const addContact = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) throw new AppError('User ID is required', 400);
  if (userId === req.userId.toString()) throw new AppError('Cannot add yourself', 400);

  const targetUser = await User.findById(userId);
  if (!targetUser) throw new AppError('User not found', 404);

  const user = await User.findById(req.userId);
  const existingContact = user.contacts.find((c) => c.user.toString() === userId);
  if (existingContact) throw new AppError('User is already in your contacts', 409);

  user.contacts.push({ user: userId });
  await user.save();

  const contactUser = await User.findById(userId).select('username displayName avatar status lastSeen');
  ApiResponse.success(res, contactUser, 'Contact added', 201);
});

const removeContact = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(req.userId);
  user.contacts = user.contacts.filter((c) => c.user.toString() !== userId);
  await user.save();

  ApiResponse.success(res, null, 'Contact removed');
});

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select('username displayName avatar status lastSeen bio');
  if (!user) throw new AppError('User not found', 404);

  ApiResponse.success(res, user);
});

const blockUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) throw new AppError('User ID is required', 400);
  if (userId === req.userId.toString()) throw new AppError('Cannot block yourself', 400);

  const targetResult = await getAccountDocumentById(userId);
  if (!targetResult) throw new AppError('User not found', 404);

  const user = await User.findById(req.userId);
  if (user.blockedUsers.includes(userId)) throw new AppError('User already blocked', 409);

  user.blockedUsers.push(userId);
  user.contacts = user.contacts.filter((c) => c.user.toString() !== userId);
  await user.save();

  if (targetResult.accountType === 'user') {
    targetResult.account.blockedBy.push(req.userId);
    await targetResult.account.save();
  }

  ApiResponse.success(res, null, 'User blocked');
});

const unblockUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(req.userId);
  user.blockedUsers = user.blockedUsers.filter((id) => id.toString() !== userId);
  await user.save();

  const targetResult = await getAccountDocumentById(userId);
  if (targetResult && targetResult.accountType === 'user') {
    targetResult.account.blockedBy = targetResult.account.blockedBy.filter(
      (id) => id.toString() !== req.userId
    );
    await targetResult.account.save();
  }

  ApiResponse.success(res, null, 'User unblocked');
});

const getBlockedUsers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('blockedUsers');
  if (!user) throw new AppError('User not found', 404);

  const blocked = await Promise.all(
    user.blockedUsers.map((id) => getAccountById(id, 'username displayName avatar status'))
  );
  const validBlocked = blocked
    .filter(Boolean)
    .map((acc) => ({ ...acc, _id: acc._id.toString() }));

  ApiResponse.success(res, validBlocked);
});

// Public consultant list for the landing page (uses Employee case managers)
const getConsultants = asyncHandler(async (req, res) => {
  const consultants = await Employee.find({ role: 'case_manager', status: 'active' })
    .select('username displayName avatar workStatus languages expertise experience totalOrder callRate createdAt')
    .sort({ workStatus: 1, createdAt: -1 })
    .limit(100);

  ApiResponse.success(res, consultants);
});

module.exports = {
  searchUsers,
  getContacts,
  addContact,
  removeContact,
  getUserById,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getConsultants,
};
