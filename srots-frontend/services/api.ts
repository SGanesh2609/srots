import axios from 'axios';

/**
 * API Gateway for Srots Platform
 * Configured exclusively for Local Java Backend integration (Spring Boot).
 */

/** Server origin — used to construct file/image URLs returned by the backend */
export const SERVER_BASE_URL = 'http://localhost:8081';

const api = axios.create({
  baseURL: `${SERVER_BASE_URL}/api/v1`,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

// ── Request interceptor: inject JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('SROTS_AUTH_TOKEN');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle token expiry / auth failures ────────────────
//
// When the backend returns 401 (token expired / invalid):
//   1. Clear all stored auth data.
//   2. Fire a CustomEvent — App.tsx listens and calls navigate('/login', {state:{from}}).
//      This keeps React Router in control (no full-page reload, keeps SPA state clean).
//
// The CustomEvent pattern avoids a circular import:
//   api.ts  →  store.ts  →  authSlice.ts  →  authService.ts  →  api.ts  (circular)
//

// Guard: fire the session-expired event only once per expiry cycle.
// Without this, parallel 401 responses trigger multiple logout redirects.
let _sessionExpiredPending = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url    = error.config?.url ?? '';

    // Skip the login endpoint itself — a wrong password returns 401 legitimately
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh');

    if (status === 401 && !isAuthEndpoint && !_sessionExpiredPending) {
      _sessionExpiredPending = true;
      console.warn('[API] 401 Unauthorized — session expired or invalid token');

      // Capture the URL the user was on BEFORE clearing anything
      const from = window.location.pathname + window.location.search;

      // Clear all stored credentials
      localStorage.removeItem('SROTS_AUTH_TOKEN');
      localStorage.removeItem('SROTS_USER_SESSION');

      // Notify App.tsx via CustomEvent — it will dispatch logout() + navigate to /login
      window.dispatchEvent(
        new CustomEvent('srots:auth:expired', { detail: { from } }),
      );
      // Reset guard after 5 s so a future genuine re-login works
      setTimeout(() => { _sessionExpiredPending = false; }, 5_000);
    }

    return Promise.reject(error);
  },
);

export default api;
