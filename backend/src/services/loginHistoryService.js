const LoginHistory = require('../models/LoginHistory');
const { buildDateFilter } = require('../utils/dateRange');

async function recordLogin(user, req = {}) {
  if (!user || !user._id) return;

  const loginFrom = user.loginFrom || req.body?.loginFrom || 'web';

  await LoginHistory.create({
    userId: user._id,
    username: user.username,
    email: user.email,
    mobile: user.mobile,
    loginFrom,
    ip: req.ip || req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress || null,
    userAgent: req.headers?.['user-agent'] || null,
    createdAt: new Date(),
  });
}

async function getLoginHistory({ page = 1, limit = 10, date = null, search = '', from = null, to = null } = {}) {
  const filter = {};

  const range = buildDateFilter({ from, to, date });
  if (range) filter.createdAt = range;

  if (search.trim()) {
    const q = search.trim();
    const isNumeric = /^\d+$/.test(q);
    filter.$or = [
      { username: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
    if (isNumeric) {
      filter.$or.push({ mobile: { $regex: q, $options: 'i' } });
    }
  }

  const total = await LoginHistory.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;

  const rows = await LoginHistory.find(filter)
    .populate('userId', 'displayName countryCode')
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  const data = rows.map((row) => ({
    _id: row._id,
    user_id: row.userId?._id,
    user_name: row.userId?.displayName || row.username || 'Unknown',
    user_email: row.email || '',
    user_mobile: row.mobile || '',
    country_code: row.userId?.countryCode || 0,
    login_from: row.loginFrom || 'web',
    ip: row.ip || '',
    user_agent: row.userAgent || '',
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

module.exports = { recordLogin, getLoginHistory };
