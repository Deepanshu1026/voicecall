import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  return (
    !error.response ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK' ||
    (error.response && error.response.status >= 500)
  );
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    // Retry on network errors or 5xx before trying to refresh token
    if (isRetryableError(error) && !originalRequest._retry && originalRequest._retryCount < 2) {
      originalRequest._retryCount = originalRequest._retryCount || 0;
      originalRequest._retryCount += 1;
      await delay(1000 * originalRequest._retryCount);
      return api(originalRequest);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: (data) => axios.post(`${API_BASE_URL}/auth/refresh-token`, data),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  updateSettings: (data) => api.put('/auth/settings', data),
  deleteAccount: () => api.delete('/auth/account'),
};

export const userAPI = {
  searchUsers: (query, page, limit) => api.get('/users/search', { params: { query, page, limit } }),
  getContacts: () => api.get('/users/contacts'),
  addContact: (userId) => api.post('/users/contacts', { userId }),
  removeContact: (userId) => api.delete(`/users/contacts/${userId}`),
  getUserById: (userId) => api.get(`/users/${userId}`),
  blockUser: (userId) => api.post('/users/block', { userId }),
  unblockUser: (userId) => api.delete(`/users/block/${userId}`),
  getBlockedUsers: () => api.get('/users/blocked'),
};

export const chatAPI = {
  getOrCreateConversation: (participantId) => api.post('/chat/conversation', { participantId }),
  getConversations: (page, limit) => api.get('/chat', { params: { page, limit } }),
  getMessages: (conversationId, page, limit, before) =>
    api.get(`/chat/${conversationId}/messages`, { params: { page, limit, before } }),
  sendMessage: (conversationId, formData) =>
    api.post(`/chat/${conversationId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  editMessage: (messageId, content) => api.put(`/chat/messages/${messageId}`, { content }),
  deleteMessage: (messageId, deleteForEveryone) =>
    api.delete(`/chat/messages/${messageId}`, { data: { deleteForEveryone } }),
  forwardMessage: (messageId, targetConversationIds) =>
    api.post(`/chat/messages/${messageId}/forward`, { targetConversationIds }),
  addReaction: (messageId, emoji) => api.post(`/chat/messages/${messageId}/reactions`, { emoji }),
  removeReaction: (messageId) => api.delete(`/chat/messages/${messageId}/reactions`),
  markAsDelivered: (messageIds) => api.put('/chat/messages/delivered', { messageIds }),
  markConversationRead: (conversationId) => api.put(`/chat/${conversationId}/read`),
};

export const callAPI = {
  initiateCall: (receiverId, type) => api.post('/calls/initiate', { receiverId, type }),
  getCallHistory: (page, limit, userId) => api.get('/calls/history', { params: { page, limit, userId } }),
  getCallById: (callId) => api.get(`/calls/${callId}`),
  updateCallStatus: (callId, data) => api.put(`/calls/${callId}`, data),
  getMissedCalls: () => api.get('/calls/missed'),
};

export default api;
