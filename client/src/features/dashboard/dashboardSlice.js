import { createSlice } from '@reduxjs/toolkit';
import { fetchDashboardStats } from './dashboardThunks';

const initialState = {
  stats: null, recentActivities: [], loading: false, refreshing: false, error: null, lastUpdated: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        if (state.stats) state.refreshing = true; else state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false; state.refreshing = false;
        state.stats = action.payload;
        state.recentActivities = action.payload.recentActivities || [];
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false; state.refreshing = false;
        state.error = action.payload || 'Failed to load dashboard data';
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
