const agentPortalService = require('../services/agentPortalService');
const { getLoginHistory } = require('../services/loginHistoryService');
const Appointment = require('../models/Appointment');
const Application = require('../models/Application');
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

async function resolveContext(req, { allowAdmin = false } = {}) {
  if (allowAdmin && req.employee.role === 'admin') {
    return { sqlId: null };
  }
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
  await resolveContext(req, { allowAdmin: true });
  const page = parseInt(req.query.page, 10) || 1;
  const date = req.query.date || null;
  const search = req.query.search || '';
  const data = await getLoginHistory({ page, date, search });
  res.status(200).json({ success: true, ...data });
});

const formatDate = (dateValue) => {
  if (!dateValue) return '';
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split('T')[0];
  }
  const str = String(dateValue).trim();
  if (!str) return '';
  // Try to extract YYYY-MM-DD from common formats
  const match = str.match(/(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  // Try DD/MM/YYYY or MM/DD/YYYY
  const parts = str.split(/[-\/\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts;
    if (a.length === 4) return `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`;
    if (c.length === 4) return `${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
  }
  return str;
};

exports.getBookedAppointments = asyncHandler(async (req, res) => {
  const { sqlId } = await resolveContext(req, { allowAdmin: true });
  const { date, search = '' } = req.query;
  const searchRegex = search.trim() ? new RegExp(search.trim(), 'i') : null;

  const employees = await Employee.find().select('sqlId displayName username').lean();
  const employeeMap = {};
  employees.forEach((e) => {
    employeeMap[e.sqlId] = e.displayName || e.username || 'Agent';
  });

  // Fetch website appointments
  const appFilter = {};
  if (date) appFilter.date = date;
  const websiteAppointments = await Appointment.find(appFilter).sort({ date: -1, timeSlot: 1 }).lean();

  let websiteItems = websiteAppointments.map((a) => ({
    _id: a._id,
    type: 'website',
    name: a.name || '',
    contact: a.contact || '',
    email: a.email || '',
    date: a.date || '',
    time: a.timeSlot || '',
    plan: a.selectedPlan || '',
    mode: a.mode || '',
    status: a.meetingConfirm || 'pending',
    query: a.query || '',
    address: a.address || '',
    referenceId: a.referenceId || '',
    source: 'Website',
    agentName: '',
    createdAt: a.submissionTime || a.createdAt || null,
  }));

  // Fetch agent applications
  const appAppFilter = {};
  if (sqlId) appAppFilter.agentId = sqlId;
  const applications = await Application.find(appAppFilter).sort({ createdAt: -1 }).lean();

  let applicationItems = applications.map((a) => {
    const details = a.details || {};
    const itemDate = formatDate(details.submission_date || details.appointment_date || a.createdAt);
    const item = {
      _id: a._id,
      type: 'application',
      name: a.clientName || details.client_name || '',
      contact: a.contactNumber || details.contact_number || '',
      email: details.email || '',
      date: itemDate,
      time: details.appointment_time || details.time_slot || '',
      plan: details.visa_type || details.visa_category || '',
      mode: details.mode || '',
      status: a.status || 'pending',
      query: details.remarks || details.query || '',
      address: details.address || '',
      referenceId: a.sqlId ? String(a.sqlId) : '',
      source: 'Application',
      agentName: employeeMap[a.agentId] || `Agent ${a.agentId}`,
      createdAt: a.createdAt || null,
    };
    return item;
  });

  if (date) {
    applicationItems = applicationItems.filter((a) => a.date === date);
  }

  if (searchRegex) {
    const matches = (item) =>
      searchRegex.test(item.name) ||
      searchRegex.test(item.contact) ||
      searchRegex.test(item.email) ||
      searchRegex.test(item.referenceId) ||
      searchRegex.test(item.query);
    websiteItems = websiteItems.filter(matches);
    applicationItems = applicationItems.filter(matches);
  }

  const allItems = [...websiteItems, ...applicationItems];
  allItems.sort((a, b) => {
    const dateA = a.date || '';
    const dateB = b.date || '';
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return String(a.time || '').localeCompare(String(b.time || ''));
  });

  // Group by date
  const grouped = {};
  allItems.forEach((item) => {
    const key = item.date || 'No Date';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  res.status(200).json({ success: true, data: grouped, total: allItems.length });
});
