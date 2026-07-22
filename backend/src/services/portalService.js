const db = require('../config/mysql');
const Employee = require('../models/Employee');

const MANAGER_ROLES = ['manager', 'senior_manager', 'admin'];

async function resolveSqlId(employee) {
  if (employee.sqlId) return employee.sqlId;

  const [rows] = await db.query(
    'SELECT id FROM calling_team WHERE user_email = ? LIMIT 1',
    [employee.email.toLowerCase().trim()]
  );

  if (rows.length) {
    const sqlId = rows[0].id;
    await Employee.updateOne({ _id: employee._id }, { sqlId });
    return sqlId;
  }

  return null;
}

function isManager(role) {
  return MANAGER_ROLES.includes(role);
}

async function getEmployeeProfile(sqlId) {
  const [rows] = await db.query(
    'SELECT id, user_name AS name, user_email AS email, user_mobile AS mobile, user_role AS role, expertise, language, experience, total_order, user_status AS status, user_current_status AS currentStatus FROM calling_team WHERE id = ? LIMIT 1',
    [sqlId]
  );
  return rows[0] || null;
}

async function listEmployees(sqlId) {
  // All active calling_team members usable for case assignment
  const [rows] = await db.query(
    "SELECT id, user_name AS name, user_email AS email, user_role AS role FROM calling_team WHERE user_status = 'Enable' ORDER BY user_name"
  );
  return rows;
}

async function listCases(sqlId, role) {
  let query = 'SELECT * FROM cases';
  const params = [];

  if (!isManager(role)) {
    query += ' WHERE assigned_employee = ?';
    params.push(sqlId);
  }

  query += ' ORDER BY updated_at DESC';

  const [rows] = await db.query(query, params);
  return rows;
}

async function getCaseById(caseId, sqlId, role) {
  const [rows] = await db.query('SELECT * FROM cases WHERE id = ? LIMIT 1', [caseId]);
  if (!rows.length) return null;
  const caseData = rows[0];

  if (!isManager(role) && caseData.assigned_employee !== sqlId) {
    return null;
  }

  return caseData;
}

async function getCaseActivities(caseId) {
  const [rows] = await db.query(
    'SELECT id, case_id, user_id, type, metadata, data, created_at FROM case_activities WHERE case_id = ? ORDER BY created_at DESC',
    [caseId]
  );
  return rows;
}

async function getCaseDocuments(caseId) {
  const [rows] = await db.query(
    'SELECT id, case_id, file_name, file_url, uploaded_by, uploaded_at FROM case_documents WHERE case_id = ? ORDER BY uploaded_at DESC',
    [caseId]
  );
  return rows;
}

async function getReopenRequests(caseId) {
  const [rows] = await db.query(
    'SELECT id, case_id, employee_id, reason, status, manager_id, created_at, resolved_at FROM reopen_requests WHERE case_id = ? ORDER BY created_at DESC',
    [caseId]
  );
  return rows;
}

async function addActivity(caseId, userId, type, metadata = {}) {
  await db.query(
    'INSERT INTO case_activities (id, case_id, user_id, type, metadata, created_at) VALUES (0, ?, ?, ?, ?, NOW())',
    [caseId, userId, type, JSON.stringify(metadata)]
  );
}

async function updateCaseStatus(caseId, status, extra = {}) {
  const allowedExtra = {};
  ['docs_status', 'docs_verified', 'docs_verified_by', 'docs_verified_at'].forEach((key) => {
    if (extra[key] !== undefined) allowedExtra[key] = extra[key];
  });

  const fields = ['status = ?'];
  const values = [status];

  Object.entries(allowedExtra).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });

  values.push(caseId);
  await db.query(`UPDATE cases SET ${fields.join(', ')} WHERE id = ?`, values);
}

async function startCase(caseId, sqlId) {
  const caseData = await getCaseById(caseId, sqlId, 'case_manager');
  if (!caseData) throw new Error('Case not found or access denied');

  await updateCaseStatus(caseId, 'in-progress');
  await addActivity(caseId, sqlId, 'case_started', { started_by: sqlId });
  return getCaseById(caseId, sqlId, 'case_manager');
}

async function requestCompletion(caseId, sqlId) {
  const caseData = await getCaseById(caseId, sqlId, 'case_manager');
  if (!caseData) throw new Error('Case not found or access denied');

  await updateCaseStatus(caseId, 'awaiting-completion-approval');
  await addActivity(caseId, sqlId, 'completion_requested', { requested_by: sqlId });
  return getCaseById(caseId, sqlId, 'case_manager');
}

async function requestReopen(caseId, sqlId, reason) {
  const caseData = await getCaseById(caseId, sqlId, 'case_manager');
  if (!caseData) throw new Error('Case not found or access denied');

  await db.query(
    'INSERT INTO reopen_requests (case_id, employee_id, reason, status, created_at) VALUES (?, ?, ?, ?, NOW())',
    [caseId, sqlId, reason, 'PENDING']
  );
  await updateCaseStatus(caseId, 'reopen-requested');
  await addActivity(caseId, sqlId, 'reopen_requested', { requested_by: sqlId, reason });
  return getCaseById(caseId, sqlId, 'case_manager');
}

async function uploadDocument(caseId, sqlId, file) {
  const caseData = await getCaseById(caseId, sqlId, 'case_manager');
  if (!caseData) throw new Error('Case not found or access denied');

  const fileUrl = `/uploads/files/${file.filename}`;
  await db.query(
    'INSERT INTO case_documents (case_id, file_name, file_url, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?, NOW())',
    [caseId, file.originalname, fileUrl, sqlId]
  );

  await updateCaseStatus(caseId, caseData.status, { docs_status: 'uploaded' });
  await addActivity(caseId, sqlId, 'document_uploaded', { file_name: file.originalname });
  return getCaseById(caseId, sqlId, 'case_manager');
}

async function assignCase(caseId, assigneeSqlId, managerSqlId) {
  const [caseRows] = await db.query('SELECT * FROM cases WHERE id = ? LIMIT 1', [caseId]);
  if (!caseRows.length) throw new Error('Case not found');

  const [employeeRows] = await db.query(
    'SELECT user_name AS name FROM calling_team WHERE id = ? LIMIT 1',
    [assigneeSqlId]
  );

  await db.query(
    'UPDATE cases SET assigned_employee = ?, status = ? WHERE id = ?',
    [assigneeSqlId, 'assigned', caseId]
  );

  await addActivity(caseId, managerSqlId, 'assigned_employee', {
    employee_id: assigneeSqlId,
    employee_name: employeeRows.length ? employeeRows[0].name : 'Unknown',
  });

  return getCaseById(caseId, managerSqlId, 'manager');
}

async function approveCompletion(caseId, managerSqlId) {
  const caseData = await getCaseById(caseId, managerSqlId, 'manager');
  if (!caseData) throw new Error('Case not found or access denied');

  await updateCaseStatus(caseId, 'completed');
  await addActivity(caseId, managerSqlId, 'case_completed', { approved_by: managerSqlId });
  return getCaseById(caseId, managerSqlId, 'manager');
}

async function approveReopen(caseId, managerSqlId, reopenRequestId) {
  const caseData = await getCaseById(caseId, managerSqlId, 'manager');
  if (!caseData) throw new Error('Case not found or access denied');

  await db.query(
    'UPDATE reopen_requests SET status = ?, manager_id = ?, resolved_at = NOW() WHERE id = ?',
    ['APPROVED', managerSqlId, reopenRequestId]
  );
  await updateCaseStatus(caseId, 'reopened');
  await addActivity(caseId, managerSqlId, 'case_reopened', { approved_by: managerSqlId });
  return getCaseById(caseId, managerSqlId, 'manager');
}

module.exports = {
  resolveSqlId,
  isManager,
  getEmployeeProfile,
  listEmployees,
  listCases,
  getCaseById,
  getCaseActivities,
  getCaseDocuments,
  getReopenRequests,
  addActivity,
  startCase,
  requestCompletion,
  requestReopen,
  uploadDocument,
  assignCase,
  approveCompletion,
  approveReopen,
};
