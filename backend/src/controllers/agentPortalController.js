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

exports.getApplicationsList = asyncHandler(async (req, res) => {
  const { sqlId } = await resolveContext(req, { allowAdmin: true });
  const { date, search = '', page = 1, limit = 50 } = req.query;
  const searchRegex = buildSearchRegex(search);
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

  const employees = await Employee.find().select('sqlId displayName username').lean();
  const employeeMap = {};
  employees.forEach((e) => {
    employeeMap[e.sqlId] = e.displayName || e.username || 'Agent';
  });

  const filter = {};
  if (sqlId) filter.agentId = sqlId;

  const skip = (pageNum - 1) * limitNum;
  const [applications, total] = await Promise.all([
    Application.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Application.countDocuments(filter),
  ]);

  let items = applications.map((a) => {
    const details = a.details || {};
    const itemDate = formatDate(details.submission_date || details.appointment_date || a.createdAt);
    const allDetails = {
      age: details.age || '',
      gender: details.gender || '',
      address: details.address || '',
      city: details.city || '',
      state: details.state || '',
      pincode: details.pincode || '',
      visaType: details.visa_type || details.visa_category || '',
      visaCountry: details.visa_country || details.country || '',
      passportValidity: details.passport_validity || '',
      education: details.education || '',
      ieltsScore: details.ielts_score || '',
      occupation: details.occupation || '',
      income: details.income || '',
      bankBalance: details.bank_balance || '',
      travelHistory: details.travel_history || '',
      refusalHistory: details.refusal_history || '',
      leadOutcome: details.lead_outcome || '',
      spouseName: details.spouse_name || '',
      spouseAge: details.spouse_age || '',
      kids: details.kids || '',
      remarks: details.remarks || '',
      query: details.query || '',
      submissionDate: details.submission_date || '',
      appointmentTime: details.appointment_time || details.time_slot || '',
    };
    return {
      _id: a._id,
      name: a.clientName || details.client_name || '',
      contact: a.contactNumber || details.contact_number || '',
      email: details.email || '',
      date: itemDate,
      time: details.appointment_time || details.time_slot || '',
      plan: details.visa_type || details.visa_category || '',
      country: details.visa_country || details.country || '',
      city: details.city || '',
      occupation: details.occupation || '',
      education: details.education || '',
      income: details.income || '',
      leadOutcome: details.lead_outcome || '',
      status: a.status || 'pending',
      query: details.remarks || details.query || '',
      address: details.address || '',
      referenceId: a.sqlId ? String(a.sqlId) : '',
      agentName: employeeMap[a.agentId] || `Agent ${a.agentId}`,
      createdAt: a.createdAt || null,
      details: allDetails,
    };
  });

  if (date) {
    items = items.filter((a) => a.date === date);
  }

  if (searchRegex) {
    items = items.filter((item) =>
      searchRegex.test(item.name) ||
      searchRegex.test(item.contact) ||
      searchRegex.test(item.email) ||
      searchRegex.test(item.referenceId) ||
      searchRegex.test(item.query) ||
      searchRegex.test(item.agentName) ||
      searchRegex.test(item.plan) ||
      searchRegex.test(item.country) ||
      searchRegex.test(item.city) ||
      searchRegex.test(item.occupation) ||
      searchRegex.test(item.leadOutcome)
    );
  }

  const filteredTotal = searchRegex || date ? items.length : total;

  res.status(200).json({
    success: true,
    data: items,
    total: filteredTotal,
    page: pageNum,
    pages: Math.ceil(filteredTotal / limitNum),
    limit: limitNum,
  });
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

exports.getNewUsers = asyncHandler(async (req, res) => {
  await resolveContext(req, { allowAdmin: true });
  const page = parseInt(req.query.page, 10) || 1;
  const date = req.query.date || null;
  const search = req.query.search || '';
  const data = await agentPortalService.getDailyLogins(page, date, search);
  res.status(200).json({ success: true, ...data });
});

const formatDate = (dateValue) => {
  if (!dateValue) return '';
  if (dateValue instanceof Date) {
    return dateValue.toISOString().split('T')[0];
  }
  const str = String(dateValue).trim();
  if (!str) return '';
  const match = str.match(/(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  const parts = str.split(/[-\/\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts;
    if (a.length === 4) return `${a}-${b.padStart(2, '0')}-${c.padStart(2, '0')}`;
    if (c.length === 4) return `${c}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
  }
  return str;
};

const buildSearchRegex = (search) => {
  const s = search ? String(search).trim() : '';
  return s ? new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;
};

exports.getAppointments = asyncHandler(async (req, res) => {
  await resolveContext(req, { allowAdmin: true });
  const { date, search = '', page = 1, limit = 50 } = req.query;
  const searchRegex = buildSearchRegex(search);
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

  const filter = {};
  if (date) filter.date = date;

  if (searchRegex) {
    filter.$or = [
      { name: searchRegex },
      { contact: searchRegex },
      { email: searchRegex },
      { referenceId: searchRegex },
      { query: searchRegex },
    ];
  }

  const skip = (pageNum - 1) * limitNum;
  const [appointments, total] = await Promise.all([
    Appointment.find(filter).sort({ date: -1, timeSlot: 1 }).skip(skip).limit(limitNum).lean(),
    Appointment.countDocuments(filter),
  ]);

  const items = appointments.map((a) => ({
    _id: a._id,
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
    createdAt: a.submissionTime || a.createdAt || null,
  }));

  res.status(200).json({
    success: true,
    data: items,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    limit: limitNum,
  });
});


