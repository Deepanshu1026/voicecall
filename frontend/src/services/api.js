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
    const token = localStorage.getItem('employeeAccessToken') || localStorage.getItem('accessToken');
    // Don't attach an existing auth token to login/register requests;
    // those endpoints use the request body and an old token can confuse debugging.
    if (token && config.url && !config.url.includes('/login') && !config.url.includes('/register')) {
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
      const requestUrl = originalRequest?.url || '';
      // Login/register failures should show their own error on the current page,
      // not trigger a redirect to the other auth portal.
      if (requestUrl.includes('/login') || requestUrl.includes('/register')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const isEmployee = !!localStorage.getItem('employeeAccessToken');
      const refreshTokenKey = isEmployee ? 'employeeRefreshToken' : 'refreshToken';
      const accessTokenKey = isEmployee ? 'employeeAccessToken' : 'accessToken';
      const refreshEndpoint = isEmployee ? '/employees/refresh-token' : '/auth/refresh-token';
      const loginPath = isEmployee ? '/agent/login' : '/login';

      try {
        const refreshToken = localStorage.getItem(refreshTokenKey);
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${API_BASE_URL}${refreshEndpoint}`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data.data;
        localStorage.setItem(accessTokenKey, accessToken);
        localStorage.setItem(refreshTokenKey, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('employeeAccessToken');
        localStorage.removeItem('employeeRefreshToken');
        window.location.href = loginPath;
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
  getConsultants: () => api.get('/users/consultants', { params: { _t: Date.now() } }),
  getContacts: () => api.get('/users/contacts'),
  addContact: (userId) => api.post('/users/contacts', { userId }),
  removeContact: (userId) => api.delete(`/users/contacts/${userId}`),
  getUserById: (userId) => api.get(`/users/${userId}`),
  blockUser: (userId) => api.post('/users/block', { userId }),
  unblockUser: (userId) => api.delete(`/users/block/${userId}`),
  getBlockedUsers: () => api.get('/users/blocked'),
  getWallet: () => api.get('/users/wallet'),
  addMoney: (amount) => api.post('/users/wallet/add-money', { amount }),
  getTransactions: (page, limit) => api.get('/users/wallet/transactions', { params: { page, limit } }),
};

export const employeeAPI = {
  login: (credentials) => api.post('/employees/login', credentials),
  register: (data) => api.post('/employees/register', data),
  getMe: () => api.get('/employees/me'),
  logout: () => api.post('/employees/logout'),
  refreshToken: (token) => api.post('/employees/refresh-token', { refreshToken: token }),
  updateProfile: (data) => api.patch('/employees/profile', data),
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
  payForConversation: (conversationId) => api.post(`/chat/${conversationId}/pay`),
  resetConversation: (conversationId) => api.post(`/chat/${conversationId}/reset`),
};

export const callAPI = {
  initiateCall: (receiverId, type) => api.post('/calls/initiate', { receiverId, type }),
  getCallHistory: (page, limit, userId) => api.get('/calls/history', { params: { page, limit, userId } }),
  getCallById: (callId) => api.get(`/calls/${callId}`),
  updateCallStatus: (callId, data) => api.put(`/calls/${callId}`, data),
  getMissedCalls: () => api.get('/calls/missed'),
};

export const portalAPI = {
  getMe: () => api.get('/portal/me'),
  getStats: () => api.get('/portal/dashboard/stats'),
  getEmployees: () => api.get('/portal/employees'),
  getCases: () => api.get('/portal/cases'),
  getCase: (id) => api.get(`/portal/cases/${id}`),
  getCaseActivities: (id) => api.get(`/portal/cases/${id}/activities`),
  getCaseDocuments: (id) => api.get(`/portal/cases/${id}/documents`),
  getReopenRequests: (id) => api.get(`/portal/cases/${id}/reopen-requests`),
  startCase: (id) => api.post(`/portal/cases/${id}/start`),
  requestCompletion: (id) => api.post(`/portal/cases/${id}/request-completion`),
  requestReopen: (id, reason) => api.post(`/portal/cases/${id}/request-reopen`, { reason }),
  uploadDocument: (id, formData) =>
    api.post(`/portal/cases/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  assignCase: (id, assigneeId) => api.post(`/portal/cases/${id}/assign`, { assigneeId }),
  approveCompletion: (id) => api.post(`/portal/cases/${id}/approve-completion`),
  approveReopen: (id, requestId) => api.post(`/portal/cases/${id}/approve-reopen`, { requestId }),
};

export const agentPortalAPI = {
  getStats: () => api.get('/agent-portal/stats'),
  getApplications: () => api.get('/agent-portal/applications'),
  getApplication: (id) => api.get(`/agent-portal/applications/${id}`),
  submitApplication: (data) => api.post('/agent-portal/applications', data),
  updateApplication: (id, data) => api.put(`/agent-portal/applications/${id}`, data),
  checkContactHistory: (contact) => api.get('/agent-portal/contact-history', { params: { contact } }),
  getPendingRemarks: () => api.get('/agent-portal/pending-remarks'),
  getDailyLogins: (page, date) => api.get('/agent-portal/daily-logins', { params: { page, date } }),
};

export default api;
