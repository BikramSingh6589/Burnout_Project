import { apiClient, requestWithFallback } from './apiClient';
export const academicService = {
  create: (payload) => apiClient.post('/academic', payload),
  list: (fallback) => requestWithFallback(() => apiClient.get('/academic'), fallback),
  update: (id, payload) => apiClient.put(/academic/, payload),
};
export const lifestyleService = {
  create: (payload) => apiClient.post('/lifestyle', payload),
  list: (fallback) => requestWithFallback(() => apiClient.get('/lifestyle'), fallback),
  update: (id, payload) => apiClient.put(/lifestyle/, payload),
};
