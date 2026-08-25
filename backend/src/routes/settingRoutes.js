const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, getContactSettings, updateContactSettings } = require('../controllers/settingController');
const { employeeAuth } = require('../middleware/employeeAuth');
const AppError = require('../utils/AppError');

const requireAdmin = (req, res, next) => {
  if (!req.employee || req.employee.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

router.get('/', getSettings);
router.put('/', employeeAuth, requireAdmin, updateSettings);

router.get('/contact', getContactSettings);
router.put('/contact', employeeAuth, requireAdmin, updateContactSettings);

module.exports = router;
