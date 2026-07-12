import { createAsyncThunk } from '@reduxjs/toolkit';
import { getDashboardStats } from '../../services/dashboardService';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDashboardStats();
      if (response && response.success) return response.data;
      return rejectWithValue(response?.message || 'Failed to fetch dashboard stats');
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch dashboard stats');
    }
  }
);
