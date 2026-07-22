const agentPortalService = require('../services/agentPortalService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

async function resolveContext(req) {
  const sqlId = await agentPortalService.resolveSqlId(req.employee);
  if (!sqlId) {
    throw new AppError('Employee is not linked to the agent portal.', 403);
  }
  return { sqlId };
}

exports.getStats = asyncHandler(async (req, res) => {
  const { sqlId } = await resolveContext(req);
  const stats = await agentPortalService.getStats(sqlId);
  res.status(200).json({ success: true, stats });
});

exports.getApplications = asyncHandler(async (req, res) => {
  const { sqlId } = await resolveContext(req);
  const applications = await agentPortalService.getApplications(sqlId);
  res.status(200).json({ success: true, applications });
});

exports.getApplication = asyncHandler(async (req, res) => {
  const { sqlId } = await resolveContext(req);
  const id = parseInt(req.params.id, 10);
  const application = await agentPortalService.getApplicationById(id, sqlId);
  if (!application) throw new AppError('Application not found', 404);
  res.status(200).json({ success: true, application });
});

exports.submitApplication = asyncHandler(async (req, res) => {
  const { sqlId } = await resolveContext(req);
  const id = await agentPortalService.submitApplication(sqlId, req.body);
  res.status(201).json({ success: true, id });
});

exports.updateApplication = asyncHandler(async (req, res) => {
  const { sqlId } = await resolveContext(req);
  const id = await agentPortalService.updateApplication(sqlId, { ...req.body, id: req.params.id });
  res.status(200).json({ success: true, id });
});

exports.checkContactHistory = asyncHandler(async (req, res) => {
  await resolveContext(req);
  const contact = req.query.contact || '';
  const history = await agentPortalService.checkContactHistory(contact);
  res.status(200).json({ success: true, history });
});

exports.getPendingRemarks = asyncHandler(async (req, res) => {
  const { sqlId } = await resolveContext(req);
  const applications = await agentPortalService.getPendingRemarks(sqlId);
  res.status(200).json({ success: true, applications });
});

exports.getDailyLogins = asyncHandler(async (req, res) => {
  await resolveContext(req);
  const page = parseInt(req.query.page, 10) || 1;
  const data = await agentPortalService.getDailyLogins(page);
  res.status(200).json({ success: true, ...data });
});
