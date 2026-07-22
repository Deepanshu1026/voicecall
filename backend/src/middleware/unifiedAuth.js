const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const config = require('../config');

const unifiedAuth = async (req, res, next) => {
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
    let account = await User.findById(decoded.id);

    if (account) {
      req.user = account;
      req.userId = account._id;
      req.accountType = 'user';
      req.account = account;
      return next();
    }

    account = await Employee.findById(decoded.id);

    if (account) {
      req.employee = account;
      req.user = account; // alias for controllers that expect req.user
      req.userId = account._id;
      req.accountType = 'employee';
      req.account = account;
      return next();
    }

    return res.status(401).json({ error: 'Account no longer exists.' });
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

module.exports = { unifiedAuth };
