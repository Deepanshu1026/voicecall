import { useState, useCallback, useRef, useMemo } from 'react';
import { chatAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';

export const useChat = () => {
  const { emit } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [hasMore, setHasMore] = useState({});
  const pageRef = useRef({});

  const loadConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const res = await chatAPI.getConversations(1, 50);
      setConversations(res.data.data || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId, reset = false) => {
    try {
      setLoadingMessages(true);
      if (reset) {
        pageRef.current[conversationId] = 1;
      }

      const page = reset ? 1 : (pageRef.current[conversationId] || 1) + 1;
      const res = await chatAPI.getMessages(conversationId, page, 30);
      const newMessages = res.data.data || [];

      setMessages((prev) => {
        const existing = reset ? [] : (prev[conversationId] || []);
        const messageMap = new Map();
        [...existing, ...newMessages].forEach((msg) => messageMap.set(msg._id, msg));
        return { ...prev, [conversationId]: Array.from(messageMap.values()) };
      });

      const pagination = res.data.pagination;
      setHasMore((prev) => ({ ...prev, [conversationId]: pagination ? pagination.page < pagination.pages : false }));
      pageRef.current[conversationId] = pagination ? pagination.page : page;
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const addMessage = useCallback((conversationId, message) => {
    setMessages((prev) => {
      const updated = [...(prev[conversationId] || [])];
      const idx = updated.findIndex((m) => m._id === message._id);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], ...message };
      } else {
        updated.push(message);
      }
      return { ...prev, [conversationId]: updated };
    });
  }, []);

  const updateMessage = useCallback((conversationId, messageId, updates) => {
    setMessages((prev) => {
      const updated = [...(prev[conversationId] || [])];
      const idx = updated.findIndex((m) => m._id === messageId);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], ...updates };
      }
      return { ...prev, [conversationId]: updated };
    });
  }, []);

  const sendMessage = useCallback(async (conversationId, content, type = 'text', replyTo = null) => {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('type', type);
    if (replyTo) formData.append('replyTo', replyTo);

    try {
      const res = await chatAPI.sendMessage(conversationId, formData);
      return res.data.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, []);

  const sendSocketMessage = useCallback(
    (conversationId, content, recipientId, replyTo = null) => {
      emit('message:send', {
        conversationId,
        content,
        type: 'text',
        replyTo,
        recipientId,
      });
    },
    [emit]
  );

  const emitTypingStart = useCallback(
    (conversationId, recipientId) => {
      emit('typing:start', { conversationId, recipientId });
    },
    [emit]
  );

  const emitTypingStop = useCallback(
    (conversationId, recipientId) => {
      emit('typing:stop', { conversationId, recipientId });
    },
    [emit]
  );

  return useMemo(() => ({
    conversations,
    messages,
    loadingMessages,
    loadingConversations,
    hasMore,
    loadConversations,
    loadMessages,
    addMessage,
    updateMessage,
    sendMessage,
    sendSocketMessage,
    emitTypingStart,
    emitTypingStop,
    setConversations,
    setMessages,
  }), [
    conversations,
    messages,
    loadingMessages,
    loadingConversations,
    hasMore,
    loadConversations,
    loadMessages,
    addMessage,
    updateMessage,
    sendMessage,
    sendSocketMessage,
    emitTypingStart,
    emitTypingStop,
  ]);
};
