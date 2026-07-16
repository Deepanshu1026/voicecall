require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const setupSocket = require('./services/socketHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const callRoutes = require('./routes/callRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.nodeEnv === 'development' ? true : config.socketCorsOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 120000,
  pingInterval: 30000,
  transports: ['websocket', 'polling'],
});

app.set('trust proxy', 1);

app.use(helmet());
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.nodeEnv === 'development') return callback(null, true);
    const allowed = [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean);
    if (allowed.some((o) => origin.startsWith(o.replace(/\/$/, '')))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/calls', callRoutes);

// Serve built frontend in production and fall back to index.html for SPA routes
const frontendDistPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (config.nodeEnv === 'production' && fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

app.use(errorHandler);

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Route not found' });
  }
  if (config.nodeEnv === 'production' && fs.existsSync(frontendDistPath)) {
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  }
  res.status(404).json({ error: 'Route not found' });
});

setupSocket(io);

const startServer = (port, maxAttempts = 5) => {
  server.listen(port, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && maxAttempts > 0) {
      console.log(`Port ${port} in use, trying ${port + 1}...`);
      server.close();
      startServer(port + 1, maxAttempts - 1);
    } else {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  });
};

connectDB().then(() => {
  startServer(config.port);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

module.exports = { app, server, io };
