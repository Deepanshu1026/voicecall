const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');

const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const filter = { userId: req.userId };
  const total = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .lean();

  ApiResponse.paginated(res, notifications, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / parseInt(limit)),
  });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    userId: req.userId,
    isRead: false,
  });

  ApiResponse.success(res, { unreadCount: count });
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: req.userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) throw new AppError('Notification not found', 404);

  ApiResponse.success(res, notification, 'Marked as read');
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.userId, isRead: false },
    { isRead: true }
  );

  ApiResponse.success(res, null, 'All notifications marked as read');
});

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead };
