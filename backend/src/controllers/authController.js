const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { generateTokens, verifyRefreshToken } = require('../utils/generateToken');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');
const { getAccountById } = require('../utils/account');

const register = asyncHandler(async (req, res) => {
  const { username, email, password, displayName, role } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    const field = existingUser.email === email ? 'email' : 'username';
    throw new AppError(`User with that ${field} already exists`, 409);
  }

  const user = await User.create({
    username,
    email,
    password,
    displayName: displayName || username,
    role: role || 'user',
  });

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  ApiResponse.success(res, { user: userObj, accessToken, refreshToken }, 'Registration successful', 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  await User.findByIdAndUpdate(user._id, {
    refreshToken,
    status: 'online',
    lastSeen: new Date(),
  });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;

  ApiResponse.success(res, { user: userObj, accessToken, refreshToken }, 'Login successful');
});

const refreshTokenHandler = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) throw new AppError('Refresh token is required', 400);

  const decoded = verifyRefreshToken(token);
  if (!decoded) throw new AppError('Invalid or expired refresh token', 401);

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token) {
    throw new AppError('Invalid refresh token', 401);
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  ApiResponse.success(res, tokens, 'Token refreshed successfully');
});

const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (user) {
    user.refreshToken = null;
    user.status = 'offline';
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });
  }

  ApiResponse.success(res, null, 'Logged out successfully');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) throw new AppError('User not found', 404);

  // Populate contacts and blocked users across both account types
  if (user.contacts?.length) {
    user.contacts = await Promise.all(
      user.contacts.map(async (c) => {
        const contact = await getAccountById(c.user, 'username displayName avatar status lastSeen');
        return { ...c, user: contact ? { ...contact, _id: c.user.toString() } : c.user };
      })
    );
  }

  if (user.blockedUsers?.length) {
    const blocked = await Promise.all(
      user.blockedUsers.map((id) => getAccountById(id, 'username displayName avatar'))
    );
    user.blockedUsers = blocked
      .filter(Boolean)
      .map((acc) => ({ ...acc, _id: acc._id.toString() }));
  }

  ApiResponse.success(res, { user }, 'User profile retrieved');
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['username', 'displayName', 'bio', 'email'];
  if (req.user && req.user.role === 'agent') {
    allowedFields.push('callRate');
  }
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Validate callRate for agents
  if (updates.callRate !== undefined) {
    const rate = Number(updates.callRate);
    if (Number.isNaN(rate) || rate < 0) {
      throw new AppError('Call rate must be a non-negative number', 400);
    }
    updates.callRate = rate;
  }

  if (req.file) {
    updates.avatar = {
      url: `/uploads/avatars/${req.file.filename}`,
      publicId: req.file.filename,
    };
  }

  const user = await User.findByIdAndUpdate(req.userId, updates, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, { user }, 'Profile updated');
});

const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  const user = await User.findById(req.userId).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  ApiResponse.success(res, { accessToken, refreshToken }, 'Password updated');
});

const updateSettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  const allowedSettings = ['theme', 'notifications', 'soundEnabled', 'privacyLastSeen', 'privacyProfilePhoto'];

  allowedSettings.forEach((setting) => {
    if (req.body[setting] !== undefined) {
      user.settings[setting] = req.body[setting];
    }
  });

  await user.save();
  ApiResponse.success(res, { settings: user.settings }, 'Settings updated');
});

const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.userId);
  ApiResponse.success(res, null, 'Account deleted');
});

module.exports = {
  register,
  login,
  refreshTokenHandler,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  updateSettings,
  deleteAccount,
};
