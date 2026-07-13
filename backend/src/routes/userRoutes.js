const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.get('/search', auth, userController.searchUsers);
router.get('/contacts', auth, userController.getContacts);
router.post('/contacts', auth, userController.addContact);
router.delete('/contacts/:userId', auth, userController.removeContact);
router.get('/blocked', auth, userController.getBlockedUsers);
router.post('/block', auth, userController.blockUser);
router.delete('/block/:userId', auth, userController.unblockUser);
router.get('/:userId', auth, userController.getUserById);

module.exports = router;
