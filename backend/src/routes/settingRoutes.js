const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getContactSettings,
  updateContactSettings,
  submitContactForm,
  getContactSubmissions,
  getMaintenance,
  enableMaintenance,
} = require('../controllers/settingController');
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

router.post('/contact/submit', submitContactForm);
router.get('/contact/submissions', employeeAuth, requireAdmin, getContactSubmissions);

// Site-wide maintenance switch (one-way)
router.get('/maintenance', getMaintenance);
router.post('/maintenance/enable', employeeAuth, requireAdmin, enableMaintenance);

module.exports = router;
