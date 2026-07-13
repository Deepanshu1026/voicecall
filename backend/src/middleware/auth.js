const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const auth = async (req, res, next) => {
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
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({ error: 'Password changed recently. Please login again.' });
    }

    req.user = user;
    req.userId = user._id;
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

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next();

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
      req.userId = user._id;
    }
    next();
  } catch {
    next();
  }
};

module.exports = { auth, optionalAuth };
