const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const { registerValidator, loginValidator, updateProfileValidator } = require('../validators/authValidator');
const validate = require('../validators/validate');

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/refresh-token', authController.refreshTokenHandler);
router.post('/logout', auth, authController.logout);

router.get('/me', auth, authController.getMe);
router.put('/profile', auth, uploadAvatar, updateProfileValidator, validate, authController.updateProfile);
router.put('/password', auth, authController.updatePassword);
router.put('/settings', auth, authController.updateSettings);
router.delete('/account', auth, authController.deleteAccount);

module.exports = router;
