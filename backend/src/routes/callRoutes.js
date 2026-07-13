const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/initiate', callController.initiateCall);
router.get('/history', callController.getCallHistory);
router.get('/missed', callController.getMissedCalls);
router.get('/:callId', callController.getCallById);
router.put('/:callId', callController.updateCallStatus);

module.exports = router;
