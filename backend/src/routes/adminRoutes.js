const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

router.use(adminAuth);

router.get('/chats/stats', adminController.getConversationStats);
router.get('/chats', adminController.getAllConversations);
router.get('/chats/:conversationId/messages', adminController.getConversationMessages);
router.put('/chats/messages/:messageId', adminController.editMessage);
router.delete('/chats/messages/:messageId', adminController.deleteMessage);

router.get('/push/tokens', adminController.getFcmTokens);
router.post('/push/send', adminController.sendManualPush);

module.exports = router;
