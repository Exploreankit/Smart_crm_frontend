import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// ─── Raw axios instance (no interceptors) used only for auth endpoints ─────────
// We use this to avoid circular dependency with api.js interceptors.
const authAxios = axios.create({ baseURL: '/api' });

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      // Controls the "session expired" modal
      sessionExpired: false,
      // Tracks an in-flight refresh promise to prevent duplicate refresh calls
      _refreshPromise: null,

      // ─── Login ──────────────────────────────────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authAxios.post('/auth/login', { email, password });
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isLoading: false,
            sessionExpired: false,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
      },

      // ─── Register ───────────────────────────────────────────────────────────
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await authAxios.post('/auth/register', userData);
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isLoading: false,
            sessionExpired: false,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.error || 'Registration failed' };
        }
      },

      // ─── Silent token refresh ────────────────────────────────────────────────
      // Returns the new access token on success, or null on failure.
      // Deduplicates concurrent refresh calls — only one request goes out at a time.
      silentRefresh: async () => {
        const state = get();

        // If a refresh is already in flight, wait for it
        if (state._refreshPromise) {
          return state._refreshPromise;
        }

        const promise = (async () => {
          try {
            const currentRefreshToken = get().refreshToken;
            if (!currentRefreshToken) return null;

            const { data } = await authAxios.post('/auth/refresh', {
              refreshToken: currentRefreshToken,
            });

            set({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: data.user,
              sessionExpired: false,
              _refreshPromise: null,
            });

            return data.accessToken;
          } catch (error) {
            // Refresh token is expired or invalid — show session expired modal
            set({
              accessToken: null,
              refreshToken: null,
              user: null,
              sessionExpired: true,
              _refreshPromise: null,
            });
            return null;
          }
        })();

        set({ _refreshPromise: promise });
        return promise;
      },

      // ─── Logout ─────────────────────────────────────────────────────────────
      logout: async () => {
        const { refreshToken } = get();
        // Best-effort server-side revocation
        if (refreshToken) {
          authAxios.post('/auth/logout', { refreshToken }).catch(() => {});
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          sessionExpired: false,
          _refreshPromise: null,
        });
      },

      // ─── Dismiss session expired modal and redirect to login ────────────────
      dismissSessionExpired: () => {
        set({ sessionExpired: false });
      },

      // ─── Refresh user profile ────────────────────────────────────────────────
      refreshUser: async () => {
        try {
          // Import api lazily to avoid circular dep at module load time
          const { default: api } = await import('../lib/api');
          const { data } = await api.get('/auth/me');
          set({ user: data });
        } catch {
          // handled by api interceptor
        }
      },
    }),
    {
      name: 'crm-auth',
      // Only persist tokens and user — never persist in-flight state
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
