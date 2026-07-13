import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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
  const listenersRef = useRef(new Map());

  const emit = useCallback((event, data, callback) => {
    const socket = getSocket();
    if (socket) {
      socket.emit(event, data, callback);
    }
  }, []);

  const on = useCallback((event, handler) => {
    const socket = getSocket();
    if (socket) {
      socket.on(event, handler);
      return () => {
        socket.off(event, handler);
      };
    }
    return () => {};
  }, []);

  const off = useCallback((event, handler) => {
    const socket = getSocket();
    if (socket) {
      if (handler) {
        socket.off(event, handler);
      } else {
        socket.off(event);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    const handleOnlineUsers = (users) => setOnlineUsers(users);
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

    socket.on('online:users', handleOnlineUsers);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.off('online:users', handleOnlineUsers);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [isAuthenticated]);

  const isUserOnline = useCallback((userId) => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  const value = {
    onlineUsers,
    typingUsers,
    emit,
    on,
    off,
    isUserOnline,
    socket: getSocket(),
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;
