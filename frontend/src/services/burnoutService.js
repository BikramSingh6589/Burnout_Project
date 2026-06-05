import { apiClient, requestWithFallback } from './apiClient';
export const burnoutService = {
  calculate: (payload) => apiClient.post('/burnout/calculate', payload),
  current: (fallback) => requestWithFallback(() => apiClient.get('/burnout/current'), fallback),
  history: (fallback) => requestWithFallback(() => apiClient.get('/burnout/history'), fallback),
};
