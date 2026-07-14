import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

let socket = null;
let currentToken = null;
let heartbeatInterval = null;

const getAccessToken = () => localStorage.getItem('accessToken');

export const connectSocket = (token) => {
  if (socket && socket.connected) return socket;
  if (socket) socket.disconnect();

  currentToken = token || getAccessToken();

  socket = io(SOCKET_URL, {
    auth: { token: currentToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    randomizationFactor: 0.5,
    timeout: 20000,
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
      socket.emit('heartbeat');
    }, 30000);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);

    // If auth failed, try refreshing the token once
    if (err.message === 'Authentication failed' || err.message === 'Authentication required') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        import('./api')
          .then(({ authAPI }) => authAPI.refreshToken?.({ refreshToken }))
          .then((res) => {
            const { accessToken } = res.data.data;
            localStorage.setItem('accessToken', accessToken);
            if (socket) {
              socket.auth = { token: accessToken };
              socket.connect();
            }
          })
          .catch(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          });
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    // Server closed the connection; allow auto-reconnect to handle it
    if (reason === 'io server disconnect') {
      socket.connect();
    }
  });

  // Refresh token before each reconnect attempt
  socket.io.on('reconnect_attempt', () => {
    const latestToken = getAccessToken();
    if (latestToken) {
      socket.auth = { token: latestToken };
    }
  });

  return socket;
};

export const disconnectSocket = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
};

export const getSocket = () => socket;

export default { connectSocket, disconnectSocket, getSocket };
