require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(',') : '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3000;
const PHP_BRIDGE_SECRET = process.env.PHP_BRIDGE_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!PHP_BRIDGE_SECRET) {
    console.error('FATAL: PHP_BRIDGE_SECRET is not set');
    process.exit(1);
}

// In-memory store (replace with MongoDB in production)
const users = new Map(); // userId -> { userId, role, displayName, agentId, socketId, status, joinedAt }
const calls = new Map(); // callId -> { callerId, calleeId, status, room }

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
const allowedOrigins = process.env.TRUSTED_ORIGINS
    ? process.env.TRUSTED_ORIGINS.split(',').map(o => o.trim())
    : [];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Enforce HTTPS in production (except health checks)
app.use((req, res, next) => {
    if (NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
        return res.status(403).json({
            success: false,
            error: 'HTTPS required'
        });
    }
    next();
});

// Rate limit the bridge endpoint
const bridgeLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many bridge requests. Please try again later.'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// JWT bridge endpoint (used by PHP portals)
app.post('/api/auth/php-bridge', bridgeLimiter, (req, res) => {
    const { sharedSecret, userId, role, displayName, agentId } = req.body || {};

    // 1. Validate shared secret
    if (!sharedSecret || sharedSecret !== PHP_BRIDGE_SECRET) {
        return res.status(401).json({
            success: false,
            error: 'Invalid shared secret'
        });
    }

    // 2. Validate required fields
    if (!userId || !role || !displayName) {
        return res.status(400).json({
            success: false,
            error: 'Missing userId, role, or displayName'
        });
    }

    if (!['agent', 'user'].includes(role)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid role. Must be agent or user.'
        });
    }

    // 3. Find or create user in memory store
    const userKey = `${role}_${userId}`;
    let user = users.get(userKey);
    if (!user) {
        user = {
            userId: String(userId),
            role,
            displayName: String(displayName),
            agentId: agentId ? String(agentId) : null,
            socketId: null,
            status: 'offline',
            joinedAt: new Date().toISOString()
        };
        users.set(userKey, user);
    } else {
        user.displayName = String(displayName);
        if (agentId) user.agentId = String(agentId);
    }

    // 4. Generate JWT (60 seconds expiry)
    const token = jwt.sign(
        {
            userId: user.userId,
            role: user.role,
            displayName: user.displayName,
            agentId: user.agentId
        },
        JWT_SECRET,
        { expiresIn: '60s' }
    );

    res.json({
        success: true,
        token
    });
});

// JWT verification helper
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

// Socket.io authentication + WebRTC signaling
io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
        return next(new Error('Authentication token required'));
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        return next(new Error('Invalid or expired token'));
    }
    socket.user = decoded;
    next();
});

io.on('connection', (socket) => {
    const user = socket.user;
    const userKey = `${user.role}_${user.userId}`;
    const storedUser = users.get(userKey);

    if (storedUser) {
        storedUser.socketId = socket.id;
        storedUser.status = 'online';
    }

    console.log(`Connected: ${user.role} ${user.userId} (${user.displayName})`);

    // Agent joins a room to receive incoming calls
    socket.join(userKey);

    // Broadcast online status change
    socket.broadcast.emit('user_status', {
        userId: user.userId,
        role: user.role,
        status: 'online'
    });

    // Handle user-initiated call to agent
    socket.on('initiate_call', ({ targetAgentId }) => {
        if (user.role !== 'user') {
            return socket.emit('call_error', { error: 'Only users can initiate calls' });
        }

        const agentKey = `agent_${targetAgentId}`;
        const agent = users.get(agentKey);
        const callId = `${user.userId}_${targetAgentId}_${Date.now()}`;

        calls.set(callId, {
            callId,
            callerId: user.userId,
            callerRole: user.role,
            calleeId: targetAgentId,
            calleeRole: 'agent',
            status: 'ringing',
            createdAt: new Date().toISOString()
        });

        // Notify the agent
        io.to(agentKey).emit('incoming_call', {
            callId,
            callerId: user.userId,
            callerName: user.displayName,
            roomId: callId
        });

        // Also notify the caller that ringing started
        socket.emit('call_ringing', { callId, agentId: targetAgentId });
    });

    // Agent accepts the call
    socket.on('accept_call', ({ callId }) => {
        const call = calls.get(callId);
        if (!call) {
            return socket.emit('call_error', { error: 'Call not found' });
        }
        if (user.role !== 'agent' || call.calleeId !== user.userId) {
            return socket.emit('call_error', { error: 'Not authorized to accept this call' });
        }

        call.status = 'accepted';
        const roomId = callId;

        // Join both users to the call room
        socket.join(roomId);

        // Notify caller to join the room
        const callerKey = `user_${call.callerId}`;
        const caller = users.get(callerKey);
        if (caller && caller.socketId) {
            io.to(caller.socketId).emit('call_accepted', { callId, roomId });
            io.sockets.sockets.get(caller.socketId)?.join(roomId);
        }

        socket.emit('call_accepted', { callId, roomId });
    });

    // Agent rejects the call
    socket.on('reject_call', ({ callId }) => {
        const call = calls.get(callId);
        if (!call) return;

        call.status = 'rejected';
        const callerKey = `user_${call.callerId}`;
        io.to(callerKey).emit('call_rejected', { callId, reason: 'Agent declined the call' });
        calls.delete(callId);
    });

    // WebRTC signaling: offer / answer / ice-candidate
    socket.on('signal', ({ roomId, to, type, data }) => {
        const payload = { roomId, from: user.userId, type, data };
        if (to) {
            io.to(to).emit('signal', payload);
        } else {
            socket.to(roomId).emit('signal', payload);
        }
    });

    // Handle end call
    socket.on('end_call', ({ roomId }) => {
        socket.to(roomId).emit('call_ended', { roomId, endedBy: user.userId });
        // Find and clean up the call record
        for (const [id, call] of calls.entries()) {
            if (callIdToRoomId(id) === roomId) {
                calls.delete(id);
                break;
            }
        }
    });

    socket.on('disconnect', () => {
        if (storedUser) {
            storedUser.socketId = null;
            storedUser.status = 'offline';
        }
        socket.broadcast.emit('user_status', {
            userId: user.userId,
            role: user.role,
            status: 'offline'
        });
        console.log(`Disconnected: ${user.role} ${user.userId}`);
    });
});

function callIdToRoomId(callId) {
    return callId; // same as callId
}

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Route SPA pages
const pages = ['auth-callback', 'dashboard', 'call'];
pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', `${page}.html`));
    });
});

// Fallback to index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Avisa Voice App running on port ${PORT}`);
    console.log(`Environment: ${NODE_ENV}`);
    console.log(`Bridge endpoint: http://localhost:${PORT}/api/auth/php-bridge`);
    console.log(`Agent dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`User call page: http://localhost:${PORT}/call`);
});

module.exports = { app, server };
