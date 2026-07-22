const Employee = require('../models/Employee');
const asyncHandler = require('../utils/asyncHandler');
const { generateTokens, verifyRefreshToken } = require('../utils/generateToken');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');

const register = asyncHandler(async (req, res) => {
  const { username, email, password, displayName, role } = req.body;

  const existingEmployee = await Employee.findOne({ $or: [{ email }, { username }] });
  if (existingEmployee) {
    const field = existingEmployee.email === email ? 'email' : 'username';
    throw new AppError(`Employee with that ${field} already exists`, 409);
  }

  const employee = await Employee.create({
    username,
    email,
    password,
    displayName: displayName || username,
    role: role || 'case_manager',
  });

  const { accessToken, refreshToken } = generateTokens(employee._id);
  employee.refreshToken = refreshToken;
  await employee.save({ validateBeforeSave: false });

  const employeeObj = employee.toObject();
  delete employeeObj.password;
  delete employeeObj.refreshToken;

  ApiResponse.success(res, { employee: employeeObj, accessToken, refreshToken }, 'Registration successful', 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // Be tolerant of leading/trailing whitespace and case differences from the UI.
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  const employee = await Employee.findOne({ email: cleanEmail }).select('+password');
  if (!employee || !(await employee.comparePassword(cleanPassword))) {
    throw new AppError('Invalid email or password', 401);
  }

  const { accessToken, refreshToken } = generateTokens(employee._id);
  employee.refreshToken = refreshToken;
  employee.workStatus = 'active';
  employee.lastSeen = new Date();
  await employee.save({ validateBeforeSave: false });

  const employeeObj = employee.toObject();
  delete employeeObj.password;
  delete employeeObj.refreshToken;

  ApiResponse.success(res, { employee: employeeObj, accessToken, refreshToken }, 'Login successful');
});

const refreshTokenHandler = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) throw new AppError('Refresh token is required', 400);

  const decoded = verifyRefreshToken(token);
  if (!decoded) throw new AppError('Invalid or expired refresh token', 401);

  const employee = await Employee.findById(decoded.id);
  if (!employee || employee.refreshToken !== token) {
    throw new AppError('Invalid refresh token', 401);
  }

  const tokens = generateTokens(employee._id);
  employee.refreshToken = tokens.refreshToken;
  await employee.save({ validateBeforeSave: false });

  ApiResponse.success(res, tokens, 'Token refreshed successfully');
});

const logout = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.userId);
  if (employee) {
    employee.refreshToken = null;
    employee.workStatus = 'unavailable';
    employee.lastSeen = new Date();
    await employee.save({ validateBeforeSave: false });
  }

  ApiResponse.success(res, null, 'Logged out successfully');
});

const getMe = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.userId);
  ApiResponse.success(res, { employee }, 'Employee profile retrieved');
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['username', 'displayName', 'email', 'expertise', 'languages', 'experience', 'callRate'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const employee = await Employee.findByIdAndUpdate(req.userId, updates, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, { employee }, 'Profile updated');
});

module.exports = {
  register,
  login,
  refreshTokenHandler,
  logout,
  getMe,
  updateProfile,
};
