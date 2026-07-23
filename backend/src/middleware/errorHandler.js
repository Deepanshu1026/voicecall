const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `Duplicate field value: ${field}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please login again.', 401);
const handleJWTExpiredError = () => new AppError('Token expired. Please login again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    error: err.message,
    stack: err.stack,
    isOperational: err.isOperational,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    const response = { error: err.message };
    if (err.details) response.details = err.details;
    res.status(err.statusCode).json(response);
  } else {
    console.error('ERROR:', err);
    res.status(500).json({ error: err.message, stack: err.stack ? err.stack.split('\n')[0] : null });
  }
};

const errorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, res);
  }

  let error = { ...err, message: err.message };

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  sendErrorProd(error, res);
};

module.exports = errorHandler;
