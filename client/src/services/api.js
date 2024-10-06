import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (credentials) => api.post('/users/login', credentials);
export const register = (userData) => api.post('/users/register', userData);
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (userData) => api.put('/users/profile', userData);
export const updatePreferences = (preferences) => api.put('/users/preferences', preferences);

export const getConversations = () => api.get('/conversations');
export const getConversation = (id) => api.get(`/conversations/${id}`);
export const getCompletion = (id) => api.get(`/completion/completion-status`, { params: { conversationId: id } });
export const updateCompletion = (id, completedItems) => api.post(`/completion/completion-status`, { conversationId: id, completedItems });
export const createConversation = (title) => api.post('/conversations', { title });
export const addMessage = (id, content) => api.post(`/conversations/${id}/messages`, { content });
export const deleteConversation = (id) => api.delete(`/conversations/${id}`);

export const generateAIResponse = (conversationId, topic, level, time_period) => api.post('/ai/generate', { conversationId, topic, level, time_period });
export const getModelInfo = () => api.get('/ai/model-info');
export const getApiUsage = () => api.get('/ai/usage');

export const editResource = (resource, timeSlot, weekNum, dayNum, contentId, resourceId, conversationId, conversation) => api.post(`/ai/edit-resource`, { resource, timeSlot, weekNum, dayNum, contentId, resourceId, conversationId, conversation });
