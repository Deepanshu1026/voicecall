require('dotenv').config();
const path = require('path');
const fs = require('fs');

module.exports = {
  port: process.env.PORT || 5002,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: (() => {
    const uri = process.env.MONGODB_URI || '';
    // Force the correct production database name regardless of env var
    if (process.env.NODE_ENV === 'production') {
      return 'mongodb+srv://avisaexpertstm_db_user:ySwllOSR02KMhFAT@cluster0.ebkh4k3.mongodb.net/voicecall?retryWrites=true&w=majority&appName=Cluster0';
    }
    return uri || 'mongodb://localhost:27017/voicecall';
  })(),
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_dev_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    expire: process.env.JWT_EXPIRE || '7d',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  },
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, ''),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean),
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DATABASE || 'my',
  },
  freeChatDurationSeconds: parseInt(process.env.FREE_CHAT_DURATION_SECONDS) || 600,
  chatPaymentAmount: parseInt(process.env.CHAT_PAYMENT_AMOUNT) || 100,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_S3_BUCKET,
  },
  encryptionKey: process.env.ENCRYPTION_KEY || 'dev_fallback_32_byte_key_here!',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100000,
  },
  socketCorsOrigin: (process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173').replace(/\/+$/, ''),
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },
  metered: {
    appName: process.env.METERED_APP_NAME || 'avisaexperts',
    apiKey: process.env.METERED_API_KEY || 'fe597f61bedf9e53c0ca99747d0f5f0d8ecd',
  },
  fcm: {
    serviceAccountPath: (() => {
      const envPath = process.env.FCM_SERVICE_ACCOUNT_PATH;
      if (envPath) return envPath;
      const defaultPath = path.resolve(__dirname, '..', '..', 'config', 'firebase-service-account.json');
      if (fs.existsSync(defaultPath)) return defaultPath;
      return '';
    })(),
    serviceAccountJson: process.env.FCM_SERVICE_ACCOUNT_JSON || '',
  },
};
