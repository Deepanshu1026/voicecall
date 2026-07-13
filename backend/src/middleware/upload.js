const upload = require('../utils/upload');

const uploadAvatar = upload.single('avatar');
const uploadFile = upload.single('file');
const uploadMultiple = upload.array('files', 10);

const handleMulterError = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'Too many files. Maximum is 10.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Invalid file field name.' });
  }
  next(err);
};

module.exports = { uploadAvatar, uploadFile, uploadMultiple, handleMulterError };
