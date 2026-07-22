import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [socketVersion, setSocketVersion] = useState(0);
  const listenersRef = useRef(new Map());
  const socketRef = useRef(getSocket());

  // Keep the ref in sync with the live socket so reconnects use the new instance
  useEffect(() => {
    const checkSocket = () => {
      const current = getSocket();
      if (current !== socketRef.current) {
        socketRef.current = current;
        setSocketVersion((v) => v + 1);
      }
    };
    const interval = setInterval(checkSocket, 1000);
    return () => clearInterval(interval);
  }, []);

  const emit = useCallback((event, data, callback) => {
    const socket = socketRef.current || getSocket();
    if (socket) {
      socket.emit(event, data, callback);
    }
  }, [socketVersion]);

  const on = useCallback((event, handler) => {
    const socket = socketRef.current || getSocket();
    if (socket) {
      socket.on(event, handler);
      return () => {
        socket.off(event, handler);
      };
    }
    return () => {};
  }, [socketVersion]);

  const off = useCallback((event, handler) => {
    const socket = socketRef.current || getSocket();
    if (socket) {
      if (handler) {
        socket.off(event, handler);
      } else {
        socket.off(event);
      }
    }
  }, [socketVersion]);

  useEffect(() => {
    const socket = socketRef.current || getSocket();
    if (!socket) return;

    const handleOnlineUsers = (users) => setOnlineUsers(users);
    const handleUserStatus = (data) => {
      setOnlineUsers((prev) => {
        const set = new Set(prev);
        if (data.status === 'online') {
          set.add(data.userId);
        } else {
          set.delete(data.userId);
        }
        return Array.from(set);
      });
    };
    const handleTypingStart = (data) => {
      setTypingUsers((prev) => ({ ...prev, [data.conversationId]: data.userId }));
    };
    const handleTypingStop = (data) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[data.conversationId];
        return next;
      });
    };

    const handleReconnect = () => {
      // Re-request online list after reconnect
      setTimeout(() => socket.emit('user:getOnline'), 500);
    };

    socket.on('online:users', handleOnlineUsers);
    socket.on('user:status', handleUserStatus);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('connect', handleReconnect);

    // Request current online list after a short delay so the backend connect handler
    // has time to mark this user online in the database.
    const getOnlineTimeout = setTimeout(() => socket.emit('user:getOnline'), 500);

    return () => {
      clearTimeout(getOnlineTimeout);
      socket.off('online:users', handleOnlineUsers);
      socket.off('user:status', handleUserStatus);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('connect', handleReconnect);
    };
  }, [isAuthenticated, socketVersion]);

  const isUserOnline = useCallback((userId) => {
    return onlineUsers.includes(String(userId));
  }, [onlineUsers]);

  const value = useMemo(() => ({
    onlineUsers,
    typingUsers,
    emit,
    on,
    off,
    isUserOnline,
    socketVersion,
    socket: socketRef.current || getSocket(),
  }), [onlineUsers, typingUsers, emit, on, off, isUserOnline, socketVersion]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;
