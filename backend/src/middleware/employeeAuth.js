const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');
const config = require('../config');

const employeeAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated. Please login.' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const employee = await Employee.findById(decoded.id);

    if (!employee) {
      return res.status(401).json({ error: 'Employee no longer exists.' });
    }

    if (employee.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ error: 'Password changed recently. Please login again.' });
    }

    req.employee = employee;
    req.userId = employee._id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(500).json({ error: 'Authentication failed.' });
  }
};

module.exports = { employeeAuth };
