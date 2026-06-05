import { apiClient, requestWithFallback } from './apiClient';

export const journalService = {
  create: (payload) => apiClient.post('/journal', payload),
  list: (fallback) => requestWithFallback(() => apiClient.get('/journal'), fallback),
  remove: (id) => apiClient.delete('/journal/' + id),
};
