const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { unifiedAuth } = require('../middleware/unifiedAuth');
const { uploadFile } = require('../middleware/upload');

router.use(unifiedAuth);

router.get('/', chatController.getConversations);
router.post('/conversation', chatController.getOrCreateConversation);
router.get('/:conversationId/messages', chatController.getMessages);
router.post('/:conversationId/messages', uploadFile, chatController.sendMessage);
router.put('/messages/:messageId', chatController.editMessage);
router.delete('/messages/:messageId', chatController.deleteMessage);
router.post('/messages/:messageId/forward', chatController.forwardMessage);
router.post('/messages/:messageId/reactions', chatController.addReaction);
router.delete('/messages/:messageId/reactions', chatController.removeReaction);
router.put('/messages/delivered', chatController.markAsDelivered);
router.put('/:conversationId/read', chatController.markConversationRead);
router.post('/:conversationId/pay', chatController.payForConversation);
router.post('/:conversationId/reset', chatController.resetConversation);

module.exports = router;
