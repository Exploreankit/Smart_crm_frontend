import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://smart-crm-backend-ju4f.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach current access token ─────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: handle token expiry with silent refresh ─────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh once per request (prevent infinite loops)
    if (originalRequest._retried) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const code = error.response?.data?.code;

    // Access token expired — try a silent refresh
    if (status === 401 && code === 'TOKEN_EXPIRED') {
      originalRequest._retried = true;

      const newAccessToken = await useAuthStore.getState().silentRefresh();

      if (newAccessToken) {
        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }

      // silentRefresh already set sessionExpired = true in the store
      return Promise.reject(error);
    }

    // Any other 401 (invalid token, no token, etc.) — show session expired
    if (status === 401 && !originalRequest._retried) {
      useAuthStore.getState().silentRefresh().then((token) => {
        if (!token) {
          // silentRefresh sets sessionExpired = true
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;
