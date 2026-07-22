const express = require('express');
const router = express.Router();
const { employeeAuth } = require('../middleware/employeeAuth');
const agentPortalController = require('../controllers/agentPortalController');

router.use(employeeAuth);

router.get('/stats', agentPortalController.getStats);
router.get('/applications', agentPortalController.getApplications);
router.get('/applications/:id', agentPortalController.getApplication);
router.post('/applications', agentPortalController.submitApplication);
router.put('/applications/:id', agentPortalController.updateApplication);
router.get('/contact-history', agentPortalController.checkContactHistory);
router.get('/pending-remarks', agentPortalController.getPendingRemarks);
router.get('/daily-logins', agentPortalController.getDailyLogins);

module.exports = router;
