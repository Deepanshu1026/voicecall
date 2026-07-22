const portalService = require('../services/portalService');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const MANAGER_ROLES = ['manager', 'senior_manager', 'admin'];

async function resolveContext(req) {
  const sqlId = await portalService.resolveSqlId(req.employee);
  if (!sqlId) {
    throw new AppError('Employee is not linked to the case portal.', 403);
  }
  return { sqlId, role: req.employee.role };
}

function ensureManager(role) {
  if (!MANAGER_ROLES.includes(role)) {
    throw new AppError('Manager access required.', 403);
  }
}

exports.getMe = asyncHandler(async (req, res) => {
  const { sqlId } = await resolveContext(req);
  const profile = await portalService.getEmployeeProfile(sqlId);
  res.status(200).json({
    success: true,
    data: {
      node: req.employee,
      portal: profile,
    },
  });
});

exports.listCases = asyncHandler(async (req, res) => {
  const { sqlId, role } = await resolveContext(req);
  const cases = await portalService.listCases(sqlId, role);
  res.status(200).json({ success: true, data: cases });
});

exports.getCase = asyncHandler(async (req, res) => {
  const { sqlId, role } = await resolveContext(req);
  const caseId = parseInt(req.params.id, 10);
  const caseData = await portalService.getCaseById(caseId, sqlId, role);
  if (!caseData) throw new AppError('Case not found or access denied.', 404);
  res.status(200).json({ success: true, data: caseData });
});

exports.getCaseActivities = asyncHandler(async (req, res) => {
  const { sqlId, role } = await resolveContext(req);
  const caseId = parseInt(req.params.id, 10);
  const caseData = await portalService.getCaseById(caseId, sqlId, role);
  if (!caseData) throw new AppError('Case not found or access denied.', 404);
  const activities = await portalService.getCaseActivities(caseId);
  res.status(200).json({ success: true, data: activities });
});

exports.getCaseDocuments = asyncHandler(async (req, res) => {
  const { sqlId, role } = await resolveContext(req);
  const caseId = parseInt(req.params.id, 10);
  const caseData = await portalService.getCaseById(caseId, sqlId, role);
  if (!caseData) throw new AppError('Case not found or access denied.', 404);
  const documents = await portalService.getCaseDocuments(caseId);
  res.status(200).json({ success: true, data: documents });
});

exports.getReopenRequests = asyncHandler(async (req, res) => {
  const { sqlId, role } = await resolveContext(req);
  const caseId = parseInt(req.params.id, 10);
  const caseData = await portalService.getCaseById(caseId, sqlId, role);
  if (!caseData) throw new AppError('Case not found or access denied.', 404);
  const requests = await portalService.getReopenRequests(caseId);
  res.status(200).json({ success: true, data: requests });
});

exports.startCase = asyncHandler(async (req, res) => {
  const { sqlId } = await resolveContext(req);
  const caseId = parseInt(req.params.id, 10);
  const caseData = await portalService.startCase(caseId, sqlId);
  res.status(200).json({ success: true, data: caseData });
});

exports.requestCompletion = asyncHandler(async (req, res) => {
  const { sqlId } = await resolveContext(req);
  const caseId = parseInt(req.params.id, 10);
  const caseData = await portalService.requestCompletion(caseId, sqlId);
  res.status(200).json({ success: true, data: caseData });
});

exports.requestReopen = asyncHandler(async (req, res) => {
  const { sqlId } = await resolveContext(req);
  const caseId = parseInt(req.params.id, 10);
  const { reason } = req.body;
  if (!reason || !reason.trim()) throw new AppError('Reopen reason is required.', 400);
  const caseData = await portalService.requestReopen(caseId, sqlId, reason.trim());
  res.status(200).json({ success: true, data: caseData });
});

exports.uploadDocument = asyncHandler(async (req, res) => {
  const { sqlId } = await resolveContext(req);
  const caseId = parseInt(req.params.id, 10);
  if (!req.file) throw new AppError('No file uploaded.', 400);
  const caseData = await portalService.uploadDocument(caseId, sqlId, req.file);
  res.status(200).json({ success: true, data: caseData });
});

exports.listEmployees = asyncHandler(async (req, res) => {
  await resolveContext(req);
  const employees = await portalService.listEmployees();
  res.status(200).json({ success: true, data: employees });
});

exports.assignCase = asyncHandler(async (req, res) => {
  const { sqlId, role } = await resolveContext(req);
  ensureManager(role);
  const caseId = parseInt(req.params.id, 10);
  const { assigneeId } = req.body;
  if (!assigneeId) throw new AppError('Assignee ID is required.', 400);
  const caseData = await portalService.assignCase(caseId, parseInt(assigneeId, 10), sqlId);
  res.status(200).json({ success: true, data: caseData });
});

exports.approveCompletion = asyncHandler(async (req, res) => {
  const { sqlId, role } = await resolveContext(req);
  ensureManager(role);
  const caseId = parseInt(req.params.id, 10);
  const caseData = await portalService.approveCompletion(caseId, sqlId);
  res.status(200).json({ success: true, data: caseData });
});

exports.approveReopen = asyncHandler(async (req, res) => {
  const { sqlId, role } = await resolveContext(req);
  ensureManager(role);
  const caseId = parseInt(req.params.id, 10);
  const { requestId } = req.body;
  if (!requestId) throw new AppError('Reopen request ID is required.', 400);
  const caseData = await portalService.approveReopen(caseId, sqlId, parseInt(requestId, 10));
  res.status(200).json({ success: true, data: caseData });
});

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const { sqlId, role } = await resolveContext(req);
  const cases = await portalService.listCases(sqlId, role);
  const total = cases.length;
  const pending = cases.filter((c) => c.status === 'pending').length;
  const inProgress = cases.filter((c) => c.status === 'in-progress').length;
  const awaiting = cases.filter((c) => c.status === 'awaiting-completion-approval').length;
  const completed = cases.filter((c) => c.status === 'completed').length;

  res.status(200).json({
    success: true,
    data: { total, pending, inProgress, awaiting, completed },
  });
});
