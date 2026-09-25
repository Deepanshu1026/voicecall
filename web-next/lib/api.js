import axios from 'axios';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://voicecall-6ylg.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export const blogAPI = {
  getPosts: (params) => api.get('/app/posts', { params }),
  getPostById: (id) => api.get(`/app/posts/${id}`),
  getRelatedPosts: (id) => api.get(`/app/posts/${id}/related`),
};

export const bannerAPI = {
  getBanner: () => api.get('/banner'),
};

export const userAPI = {
  getConsultants: () => api.get('/users/consultants'),
};

export const settingsAPI = {
  getContact: () => api.get('/settings/contact'),
};

export const reviewsAPI = {
  getPublic: () => api.get('/app/reviews'),
};

export default api;
