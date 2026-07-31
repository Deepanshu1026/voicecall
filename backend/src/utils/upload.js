const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadsDir = path.join(__dirname, '../../uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const filesDir = path.join(uploadsDir, 'files');

[uploadsDir, avatarsDir, filesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'avatar' || file.fieldname === 'profile') {
      cb(null, avatarsDir);
    } else {
      cb(null, filesDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedFileTypes = [
    ...allowedImageTypes,
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed',
    'text/plain',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/webm',
  ];

  if (file.fieldname === 'avatar' || file.fieldname === 'profile') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures'), false);
    }
  } else {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false);
    }
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
});

module.exports = upload;
