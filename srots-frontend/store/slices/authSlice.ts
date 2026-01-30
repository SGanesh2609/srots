
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { User } from '../../types';
// import { AuthService } from '../../services/authService';

// interface AuthState {
//   user: User | null;
//   isAuthenticated: boolean;
//   loading: boolean;
//   error: string | null;
// }

// /**
//  * Deterministic hydration from localStorage on initialization.
//  */
// const getSavedUser = (): User | null => {
//   try {
//     const saved = localStorage.getItem('SROTS_USER_SESSION');
//     return saved ? JSON.parse(saved) : null;
//   } catch (e) {
//     console.error("Failed to parse saved user session", e);
//     return null;
//   }
// };

// const savedUser = getSavedUser();

// const initialState: AuthState = {
//   user: savedUser,
//   isAuthenticated: !!savedUser,
//   loading: false,
//   error: null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     loginStart: (state) => {
//       state.loading = true;
//       state.error = null;
//     },
//     loginSuccess: (state, action: PayloadAction<User>) => {
//       state.loading = false;
//       state.isAuthenticated = true;
//       state.user = action.payload;
//       state.error = null;
//       // Persist session to survive refreshes
//       localStorage.setItem('SROTS_USER_SESSION', JSON.stringify(action.payload));
//     },
//     loginFailure: (state, action: PayloadAction<string>) => {
//       state.loading = false;
//       state.isAuthenticated = false;
//       state.user = null;
//       state.error = action.payload;
//     },
//     logout: (state) => {
//       state.user = null;
//       state.isAuthenticated = false;
//       state.error = null;
      
//       // PURGE ALL DATA DEFINITIVELY
//       localStorage.clear();
      
//       // Reset URL state
//       window.location.hash = ''; 
//     },
//     updateUser: (state, action: PayloadAction<User>) => {
//         state.user = action.payload;
//         localStorage.setItem('SROTS_USER_SESSION', JSON.stringify(action.payload));
//     }
//   },
// });

// export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = authSlice.actions;

// /**
//  * Async Thunk for Login
//  */
// export const login = (credentials: { username: string; password?: string }) => async (dispatch: any) => {
//     dispatch(loginStart());
//     try {
//         const user = await AuthService.authenticateUser(credentials.username, credentials.password);
//         dispatch(loginSuccess(user));
//     } catch (err: any) {
//         console.error("Authentication Error:", err);
//         const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
//         dispatch(loginFailure(errorMessage));
//     }
// };

// export default authSlice.reducer;


import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { AuthService } from '../../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const getSavedUser = (): User | null => {
  try {
    const saved = localStorage.getItem('SROTS_USER_SESSION');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Failed to parse saved user session', e);
    return null;
  }
};

const initialState: AuthState = {
  user: getSavedUser(),
  isAuthenticated: !!getSavedUser(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;

      // Save both token and user session
      localStorage.setItem('SROTS_USER_SESSION', JSON.stringify(action.payload));
      // Assuming AuthService.authenticateUser already saved the token
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clean ALL auth data
      localStorage.removeItem('SROTS_AUTH_TOKEN');
      localStorage.removeItem('SROTS_USER_SESSION');

      // Force navigation to login
      window.location.hash = '';
      window.location.pathname = '/';
      // Do NOT reload here — let App.tsx handle it via !currentUser
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('SROTS_USER_SESSION', JSON.stringify(action.payload));
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = authSlice.actions;

export const login = (credentials: { username: string; password?: string }) => async (dispatch: any) => {
  dispatch(loginStart());
  try {
    const user = await AuthService.authenticateUser(credentials.username, credentials.password);
    dispatch(loginSuccess(user));
  } catch (err: any) {
    console.error('Authentication Error:', err);
    const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
    dispatch(loginFailure(errorMessage));
  }
};

export default authSlice.reducer;