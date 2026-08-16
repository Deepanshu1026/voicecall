const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { auth } = require('../middleware/auth');
const AppError = require('../utils/AppError');

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

router.get('/', getSettings);
router.put('/', auth, requireAdmin, updateSettings);

module.exports = router;
