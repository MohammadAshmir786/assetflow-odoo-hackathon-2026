import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

/**
 * Thunk to handle backend authentication using POST /api/auth/login.
 * Returns { token, user } on success.
 */
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data?.message || 'Login failed');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);
