import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

let socket = null;
let currentToken = null;
let heartbeatInterval = null;

const getAccessToken = () => localStorage.getItem('employeeAccessToken') || localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('employeeRefreshToken') || localStorage.getItem('refreshToken');
const isEmployeeToken = () => !!localStorage.getItem('employeeAccessToken');
const getTokenStorageKeys = () => {
  return isEmployeeToken()
    ? { access: 'employeeAccessToken', refresh: 'employeeRefreshToken', loginPath: '/agent/login' }
    : { access: 'accessToken', refresh: 'refreshToken', loginPath: '/login' };
};

export const connectSocket = (token) => {
  // If a socket is already connected with the same token, reuse it.
  // Otherwise, disconnect the old one (e.g., guest socket) so we can
  // authenticate with the new token (user or employee).
  if (socket && socket.connected && token === currentToken) return socket;
  if (socket) socket.disconnect();

  currentToken = token || getAccessToken();
  const authOptions = currentToken ? { token: currentToken } : {};

  socket = io(SOCKET_URL, {
    auth: authOptions,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    randomizationFactor: 0.5,
    timeout: 20000,
    withCredentials: true,
    // Note: pingInterval/pingTimeout are server-controlled; set them in backend/src/index.js
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id, currentToken ? 'authenticated' : 'guest');
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (currentToken) {
      heartbeatInterval = setInterval(() => {
        socket.emit('heartbeat');
      }, 20000);
    }
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);

    // If auth failed, try refreshing the token once (only for logged-in users)
    if (err.message === 'Authentication failed' || err.message === 'Authentication required') {
      if (!currentToken) return; // guest connection errors are ignored
      const refreshToken = getRefreshToken();
      const { access, refresh, loginPath } = getTokenStorageKeys();
      if (refreshToken) {
        import('./api')
          .then((api) => {
            const refreshFn = isEmployeeToken() ? api.employeeAPI.refreshToken : api.authAPI.refreshToken;
            return refreshFn?.({ refreshToken });
          })
          .then((res) => {
            const { accessToken } = res.data.data;
            localStorage.setItem(access, accessToken);
            if (socket) {
              socket.auth = { token: accessToken };
              socket.connect();
            }
          })
          .catch(() => {
            localStorage.removeItem(access);
            localStorage.removeItem(refresh);
            window.location.href = loginPath;
          });
      } else {
        localStorage.removeItem(access);
        localStorage.removeItem(refresh);
        window.location.href = loginPath;
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
