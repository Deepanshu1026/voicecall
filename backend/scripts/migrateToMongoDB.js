require('dotenv').config();
const mongoose = require('mongoose');
const mysql = require('../src/config/mysql');
const Application = require('../src/models/Application');
const ApplicationLog = require('../src/models/ApplicationLog');

const parseDetails = (value) => {
  if (!value) return {};
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (err) {
    console.warn('Failed to parse details JSON, returning empty object:', value);
    return {};
  }
};

const migrateApplications = async () => {
  const [rows] = await mysql.query('SELECT * FROM applications ORDER BY id ASC');
  console.log(`Found ${rows.length} applications to migrate`);

  const docs = rows.map((row) => ({
    sqlId: row.id,
    agentId: row.agent_id,
    clientName: row.client_name,
    contactNumber: row.contact_number,
    details: parseDetails(row.details),
    status: row.status || 'pending',
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  }));

  await Application.deleteMany({});
  const result = await Application.insertMany(docs, { ordered: false });
  console.log(`Migrated ${result.length} applications`);
};

const migrateApplicationLogs = async () => {
  const [rows] = await mysql.query('SELECT * FROM application_logs ORDER BY id ASC');
  console.log(`Found ${rows.length} application logs to migrate`);

  const docs = rows.map((row) => ({
    sqlId: row.id,
    applicationId: row.application_id,
    userId: row.user_id,
    actionType: row.action_type,
    details: parseDetails(row.details),
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  }));

  await ApplicationLog.deleteMany({});
  const result = await ApplicationLog.insertMany(docs, { ordered: false });
  console.log(`Migrated ${result.length} application logs`);
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voicecall');
    console.log('MongoDB connected');

    await migrateApplications();
    await migrateApplicationLogs();

    console.log('Migration completed');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
