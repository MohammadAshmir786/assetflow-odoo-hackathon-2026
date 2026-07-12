import { createSlice } from '@reduxjs/toolkit';
import { login } from './authThunks';

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  initialized: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    restoreAuth: (state) => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          state.token = token;
          state.user = {
            ...parsedUser,
            id: parsedUser.id || parsedUser._id,
            _id: parsedUser._id || parsedUser.id
          };
        } catch (e) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          state.token = null;
          state.user = null;
        }
      }
      state.initialized = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.token = action.payload.token;
        
        const rawUser = action.payload.user;
        state.user = {
          ...rawUser,
          id: rawUser.id || rawUser._id,
          _id: rawUser._id || rawUser.id
        };
        
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      });
  }
});

export const { restoreAuth, logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
