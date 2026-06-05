import { apiClient, requestWithFallback } from './apiClient';
import { studentProfile } from '../data/mockData';
export const authService = {
  register: (payload) => apiClient.post('/auth/register', payload),
  login: (payload) => apiClient.post('/auth/login', payload),
  logout: () => apiClient.post('/auth/logout'),
  resetPassword: (payload) => apiClient.post('/auth/reset-password', payload),
  profile: () => requestWithFallback(() => apiClient.get('/auth/profile'), studentProfile),
};
