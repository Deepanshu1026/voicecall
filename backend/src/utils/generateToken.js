const jwt = require('jsonwebtoken');
const config = require('../config');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });

  const refreshToken = jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpire,
  });

  return { accessToken, refreshToken };
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch {
    return null;
  }
};

module.exports = { generateTokens, verifyRefreshToken };
