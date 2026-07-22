const express = require('express');
const router = express.Router();
const { employeeAuth } = require('../middleware/employeeAuth');
const portalController = require('../controllers/portalController');
const upload = require('../utils/upload');

router.use(employeeAuth);

router.get('/me', portalController.getMe);
router.get('/dashboard/stats', portalController.getDashboardStats);
router.get('/employees', portalController.listEmployees);

router.get('/cases', portalController.listCases);
router.get('/cases/:id', portalController.getCase);
router.get('/cases/:id/activities', portalController.getCaseActivities);
router.get('/cases/:id/documents', portalController.getCaseDocuments);
router.get('/cases/:id/reopen-requests', portalController.getReopenRequests);

router.post('/cases/:id/start', portalController.startCase);
router.post('/cases/:id/request-completion', portalController.requestCompletion);
router.post('/cases/:id/request-reopen', portalController.requestReopen);
router.post('/cases/:id/upload', upload.single('document'), portalController.uploadDocument);
router.post('/cases/:id/assign', portalController.assignCase);
router.post('/cases/:id/approve-completion', portalController.approveCompletion);
router.post('/cases/:id/approve-reopen', portalController.approveReopen);

module.exports = router;
