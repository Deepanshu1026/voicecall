const User = require('../models/User');
const Employee = require('../models/Employee');

async function getAccountById(id, select = '') {
  if (!id) return null;
  const user = select
    ? await User.findById(id).select(select).lean()
    : await User.findById(id).lean();
  if (user) return { ...user, accountType: 'user' };

  const employee = select
    ? await Employee.findById(id).select(select).lean()
    : await Employee.findById(id).lean();
  if (employee) return { ...employee, accountType: 'employee' };

  return null;
}

async function getAccountDocumentById(id, select = '') {
  if (!id) return null;
  const user = select
    ? await User.findById(id).select(select)
    : await User.findById(id);
  if (user) return { account: user, accountType: 'user' };

  const employee = select
    ? await Employee.findById(id).select(select)
    : await Employee.findById(id);
  if (employee) return { account: employee, accountType: 'employee' };

  return null;
}

module.exports = { getAccountById, getAccountDocumentById };
