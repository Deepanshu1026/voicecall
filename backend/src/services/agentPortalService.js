const Application = require('../models/Application');
const ApplicationLog = require('../models/ApplicationLog');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { buildDateFilter } = require('../utils/dateRange');

function mapApplication(row) {
  return {
    id: row.sqlId || row._id,
    client_name: row.clientName,
    contact_number: row.contactNumber,
    status: row.status,
    details: row.details || {},
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

async function resolveSqlId(employee) {
  if (employee.sqlId) return employee.sqlId;

  const match = await Employee.findOne({
    email: employee.email.toLowerCase().trim(),
  }).select('sqlId');

  if (match?.sqlId) {
    await Employee.updateOne({ _id: employee._id }, { sqlId: match.sqlId });
    return match.sqlId;
  }

  return null;
}

async function getApplications(sqlId, { page = 1, limit = 10, search = '', status = '', outcome = '' } = {}) {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const filter = { agentId: sqlId };
  if (status && status !== 'all') filter.status = status;

  if (search && String(search).trim()) {
    const q = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(q, 'i');
    const numeric = parseInt(q, 10);
    filter.$or = [
      { clientName: rx },
      { contactNumber: rx },
      ...(Number.isNaN(numeric) ? [] : [{ sqlId: numeric }]),
    ];
  }

  if (outcome && String(outcome).trim()) {
    const oq = String(outcome).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter['details.lead_outcome'] = new RegExp(oq, 'i');
  }

  const total = await Application.countDocuments(filter);
  const totalPages = total === 0 ? 1 : Math.ceil(total / limitNum);
  const skip = (pageNum - 1) * limitNum;

  const rows = await Application.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  return {
    applications: rows.map(mapApplication),
    pagination: {
      current_page: pageNum,
      total_pages: totalPages,
      total_records: total,
      has_more: pageNum < totalPages,
    },
  };
}

async function getStats(sqlId) {
  const stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
  const rows = await Application.aggregate([
    { $match: { agentId: sqlId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  rows.forEach((row) => {
    stats.total += row.count;
    if (stats[row._id] !== undefined) {
      stats[row._id] = row.count;
    }
  });
  return stats;
}

async function getApplicationById(id, sqlId) {
  const app = await Application.findOne({ sqlId: id, agentId: sqlId }).lean();
  if (!app) return null;

  const logs = await ApplicationLog.find({ applicationId: id })
    .sort({ createdAt: -1 })
    .lean();

  const userIds = [...new Set(logs.map((log) => log.userId).filter(Boolean))];
  const employees = await Employee.find({ sqlId: { $in: userIds } })
    .select('sqlId displayName username')
    .lean();
  const nameBySqlId = Object.fromEntries(
    employees.map((e) => [e.sqlId, e.displayName || e.username || 'System'])
  );

  const mappedLogs = logs.map((log) => ({
    id: log.sqlId,
    application_id: log.applicationId,
    user_id: log.userId,
    user_name: nameBySqlId[log.userId] || 'System',
    action_type: log.actionType,
    details: log.details || {},
    created_at: log.createdAt,
  }));

  return {
    ...mapApplication(app),
    logs: mappedLogs,
  };
}

async function logActivity(appId, userId, actionType, details = {}) {
  await ApplicationLog.create({
    applicationId: appId,
    userId,
    actionType,
    details,
    createdAt: new Date(),
  });
}

async function submitApplication(sqlId, input) {
  if (!input.client_name || !input.contact_number) {
    throw new Error('Name and Contact Number are required');
  }

  const details = { ...input };
  delete details.client_name;
  delete details.contact_number;
  delete details.submission_date;

  const createdAt = input.submission_date
    ? new Date(`${input.submission_date} ${new Date().toTimeString().slice(0, 8)}`)
    : new Date();

  // Generate a new sqlId (incrementing integer) for the new application
  const maxSqlId = await Application.findOne({}, {}, { sort: { sqlId: -1 } }).select('sqlId').lean();
  const nextSqlId = (maxSqlId?.sqlId || 0) + 1;

  const app = await Application.create({
    sqlId: nextSqlId,
    agentId: sqlId,
    clientName: input.client_name.trim(),
    contactNumber: input.contact_number.trim(),
    details,
    status: 'pending',
    createdAt,
    updatedAt: createdAt,
  });

  await logActivity(app.sqlId, sqlId, 'created', { client: input.client_name.trim() });
  return app.sqlId;
}

async function updateApplication(sqlId, input) {
  if (!input.id || !input.client_name || !input.contact_number) {
    throw new Error('ID, Name and Contact Number are required');
  }

  const appId = parseInt(input.id, 10);
  const existing = await Application.findOne({ sqlId: appId, agentId: sqlId }).lean();
  if (!existing) {
    throw new Error('Application not found or unauthorized');
  }

  // Build the new details from the submitted fields (excluding top-level ones)
  const submittedDetails = { ...input };
  delete submittedDetails.id;
  delete submittedDetails.client_name;
  delete submittedDetails.contact_number;
  delete submittedDetails.submission_date;

  // Merge with existing details so fields not in the form are preserved
  const details = { ...(existing.details || {}), ...submittedDetails };

  const updatedAt = new Date();
  const update = {
    clientName: input.client_name.trim(),
    contactNumber: input.contact_number.trim(),
    details,
    updatedAt,
  };

  if (input.submission_date) {
    const incoming = new Date(`${input.submission_date} ${new Date().toTimeString().slice(0, 8)}`);
    const existingDate = existing.createdAt ? new Date(existing.createdAt) : null;
    const sameDay = existingDate && !Number.isNaN(existingDate.getTime())
      && existingDate.toDateString() === incoming.toDateString();
    // Only move the submission date when the agent actually changed it.
    if (!sameDay) update.createdAt = incoming;
  }

  await Application.updateOne({ sqlId: appId, agentId: sqlId }, update);
  await logActivity(appId, sqlId, 'updated', { client: input.client_name.trim() });
  return appId;
}

async function checkContactHistory(contactNumber, currentSqlId = null) {
  if (!contactNumber || !contactNumber.trim()) {
    return [];
  }

  const clean = contactNumber.trim();
  const rows = await Application.find({
    $or: [
      { contactNumber: clean },
      { contactNumber: { $regex: clean, $options: 'i' } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const agentIds = [...new Set(rows.map((r) => r.agentId).filter(Boolean))];
  const employees = await Employee.find({ sqlId: { $in: agentIds } })
    .select('sqlId displayName username')
    .lean();
  const nameBySqlId = Object.fromEntries(
    employees.map((e) => [e.sqlId, e.displayName || e.username || 'Unknown'])
  );

  return rows.map((row) => {
    const details = row.details || {};
    return {
      id: row.sqlId,
      client_name: row.clientName,
      contact_number: row.contactNumber,
      created_at: row.createdAt,
      status: row.status,
      details,
      visa_type: details.visa_type || 'N/A',
      agent_name: nameBySqlId[row.agentId] || 'Unknown',
      agent_id: row.agentId ?? null,
      is_mine: currentSqlId != null && String(row.agentId) === String(currentSqlId),
    };
  });
}

async function getPendingRemarks(sqlId) {
  const rows = await Application.find({
    agentId: sqlId,
    status: 'pending',
  }).lean();

  const appIds = rows.map((r) => r.sqlId);
  const remarkCounts = await ApplicationLog.aggregate([
    { $match: { applicationId: { $in: appIds }, actionType: 'admin_remark' } },
    { $group: { _id: '$applicationId', count: { $sum: 1 } } },
  ]);
  const remarkCountByApp = Object.fromEntries(remarkCounts.map((r) => [r._id, r.count]));

  return rows
    .filter((row) => remarkCountByApp[row.sqlId] > 0)
    .map((row) => ({
      ...mapApplication(row),
      remark_count: remarkCountByApp[row.sqlId],
    }));
}

async function getDailyLogins(page = 1, date = null, search = '', limit = 10, from = null, to = null) {
  const filter = { role: 'user' };

  const range = buildDateFilter({ from, to, date });
  if (range) filter.createdAt = range;

  if (search.trim()) {
    const q = search.trim();
    const isNumeric = /^\d+$/.test(q);
    filter.$or = [
      { displayName: { $regex: q, $options: 'i' } },
      { username: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
    if (isNumeric) {
      filter.$or.push({ mobile: { $regex: q, $options: 'i' } });
    }
  }

  const total = await User.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;

  const rows = await User.find(filter)
    .select('displayName username email countryCode mobile loginFrom createdAt')
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  const data = rows.map((row) => ({
    user_name: row.displayName || row.username || 'Unknown',
    login_from: row.loginFrom || 'web',
    user_email: row.email || '',
    country_code: row.countryCode || 0,
    user_mobile: row.mobile || '',
    created_at: row.createdAt,
  }));

  return {
    data,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_records: total,
    },
  };
}

async function getNewUsersForExport(from = null, to = null, search = '') {
  const filter = {
    role: 'user',
    username: { $nin: [null, ''], $not: /guest/i },
    email: {
      $nin: [null, ''],
      // Exclude auto-generated guest / placeholder accounts.
      $not: /guest|example\.com$|placeholder\.local$/i,
    },
    mobile: { $nin: [null, ''] },
  };

  const range = buildDateFilter({ from, to });
  if (range) filter.createdAt = range;

  if (search && search.trim()) {
    const q = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(q, 'i');
    filter.$or = [
      { displayName: regex },
      { username: regex },
      { email: regex },
      { mobile: regex },
    ];
  }

  const rows = await User.find(filter)
    .select('displayName username email countryCode mobile loginFrom createdAt')
    .sort({ createdAt: -1 })
    .lean();

  return rows;
}

module.exports = {
  resolveSqlId,
  getApplications,
  getStats,
  getApplicationById,
  logActivity,
  submitApplication,
  updateApplication,
  checkContactHistory,
  getPendingRemarks,
  getDailyLogins,
  getNewUsersForExport,
};
