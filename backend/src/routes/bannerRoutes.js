const express = require('express');
const router = express.Router();
const { getBanner, updateBanner } = require('../controllers/bannerController');
const { employeeAuth } = require('../middleware/employeeAuth');
const AppError = require('../utils/AppError');

const requireAdmin = (req, res, next) => {
  if (!req.employee || req.employee.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

router.get('/', getBanner);
router.put('/', employeeAuth, requireAdmin, updateBanner);

module.exports = router;
