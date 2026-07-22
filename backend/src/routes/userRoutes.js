const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const walletController = require('../controllers/walletController');
const { auth } = require('../middleware/auth');

// Public consultant listing for the user-side landing page
router.get('/consultants', userController.getConsultants);

router.get('/search', auth, userController.searchUsers);
router.get('/contacts', auth, userController.getContacts);
router.post('/contacts', auth, userController.addContact);
router.delete('/contacts/:userId', auth, userController.removeContact);
router.get('/blocked', auth, userController.getBlockedUsers);
router.post('/block', auth, userController.blockUser);
router.delete('/block/:userId', auth, userController.unblockUser);

// Wallet routes
router.get('/wallet', auth, walletController.getWallet);
router.post('/wallet/add-money', auth, walletController.addMoney);
router.get('/wallet/transactions', auth, walletController.getTransactions);

router.get('/:userId', auth, userController.getUserById);

module.exports = router;
