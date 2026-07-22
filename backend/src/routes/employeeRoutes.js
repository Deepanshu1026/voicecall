const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { employeeAuth } = require('../middleware/employeeAuth');

router.post('/login', employeeController.login);
router.post('/register', employeeController.register);
router.post('/refresh-token', employeeController.refreshTokenHandler);

router.get('/me', employeeAuth, employeeController.getMe);
router.post('/logout', employeeAuth, employeeController.logout);
router.patch('/profile', employeeAuth, employeeController.updateProfile);

module.exports = router;
