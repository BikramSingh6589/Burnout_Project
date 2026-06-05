import axios from 'axios';
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('burnout_auth_token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});
export async function requestWithFallback(request, fallback) {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) return fallback;
    throw error;
  }
}
