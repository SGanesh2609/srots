import { createSlice, PayloadAction, Dispatch } from '@reduxjs/toolkit';
import { User } from '../../types';
import { AuthService } from '../../services/authService';

interface AuthState {
  user:            User | null;
  isAuthenticated: boolean;
  loading:         boolean;
  error:           string | null;
}

// ── JWT expiry check (no external library needed) ─────────────────────────────
//  JWT payload is base64-encoded JSON. The `exp` field is a Unix timestamp (seconds).
export function isTokenExpired(token: string): boolean {
  try {
    const payloadB64 = token.split('.')[1];
    if (!payloadB64) return true;
    const payload = JSON.parse(atob(payloadB64));
    if (typeof payload.exp !== 'number') return true;
    // Add 10-second buffer so we don't restore a token that expires in the next few seconds
    return payload.exp * 1000 < Date.now() + 10_000;
  } catch {
    return true; // Unparseable → treat as expired
  }
}

// ── Restore saved session ONLY if the JWT is still valid ─────────────────────
function getSavedUser(): User | null {
  try {
    const token = localStorage.getItem('SROTS_AUTH_TOKEN');

    // No token at all → clear any stale session and treat as logged out
    if (!token) {
      localStorage.removeItem('SROTS_USER_SESSION');
      return null;
    }

    // Token exists but expired → clear everything, show login
    if (isTokenExpired(token)) {
      console.info('[Auth] Saved JWT is expired — clearing session');
      localStorage.removeItem('SROTS_AUTH_TOKEN');
      localStorage.removeItem('SROTS_USER_SESSION');
      return null;
    }

    // Valid token — restore session
    const saved = localStorage.getItem('SROTS_USER_SESSION');
    return saved ? (JSON.parse(saved) as User) : null;
  } catch (e) {
    console.error('[Auth] Failed to restore saved session', e);
    localStorage.removeItem('SROTS_AUTH_TOKEN');
    localStorage.removeItem('SROTS_USER_SESSION');
    return null;
  }
}

// ── Initial state ─────────────────────────────────────────────────────────────
const initialState: AuthState = {
  user:            getSavedUser(),
  isAuthenticated: !!getSavedUser(),
  loading:         false,
  error:           null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error   = null;
    },

    loginSuccess: (state, action: PayloadAction<User>) => {
      state.loading         = false;
      state.isAuthenticated = true;
      state.user            = action.payload;
      state.error           = null;
      localStorage.setItem('SROTS_USER_SESSION', JSON.stringify(action.payload));
    },

    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading         = false;
      state.isAuthenticated = false;
      state.user            = null;
      state.error           = action.payload;
    },

    logout: (state) => {
      state.user            = null;
      state.isAuthenticated = false;
      state.error           = null;
      localStorage.removeItem('SROTS_AUTH_TOKEN');
      localStorage.removeItem('SROTS_USER_SESSION');
      // Navigation is handled entirely by App.tsx — no window.location here.
    },

    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('SROTS_USER_SESSION', JSON.stringify(action.payload));
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = authSlice.actions;

export const login =
  (credentials: { username: string; password?: string }) =>
  async (dispatch: Dispatch) => {
    dispatch(loginStart());
    try {
      const user = await AuthService.authenticateUser(
        credentials.username,
        credentials.password,
      );
      dispatch(loginSuccess(user));
    } catch (err: any) {
      console.error('[Auth] Login error:', err);
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      dispatch(loginFailure(msg));
    }
  };

export default authSlice.reducer;
