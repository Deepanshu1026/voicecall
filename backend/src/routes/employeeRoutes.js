const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const messageTemplateController = require('../controllers/messageTemplateController');
const { employeeAuth } = require('../middleware/employeeAuth');

router.post('/login', employeeController.login);
router.post('/refresh-token', employeeController.refreshTokenHandler);

router.get('/me', employeeAuth, employeeController.getMe);
router.post('/logout', employeeAuth, employeeController.logout);
router.patch('/profile', employeeAuth, employeeController.updateProfile);

// Message templates (agent-only quick replies)
router.get('/me/templates', employeeAuth, messageTemplateController.getTemplates);
router.post('/me/templates', employeeAuth, messageTemplateController.createTemplate);
router.put('/me/templates/:id', employeeAuth, messageTemplateController.updateTemplate);
router.delete('/me/templates/:id', employeeAuth, messageTemplateController.deleteTemplate);

module.exports = router;
