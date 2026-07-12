import { createSlice } from '@reduxjs/toolkit';
import {
  fetchMaintenance,
  createMaintenance,
  approveMaintenance,
  startMaintenance,
  resolveMaintenance,
} from './maintenanceThunks';

const initialState = {
  items: [],
  loading: false,
  submitting: false,
  actionLoadingId: null,
  error: null,
  filters: {
    search: '',
    status: 'All',
    priority: 'All',
  },
};

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    setMaintenanceFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearMaintenanceFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearMaintenanceError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchMaintenance
    builder
      .addCase(fetchMaintenance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaintenance.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMaintenance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load maintenance logs';
      });

    // createMaintenance
    builder
      .addCase(createMaintenance.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createMaintenance.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(createMaintenance.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });

    // approveMaintenance
    builder
      .addCase(approveMaintenance.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg;
        state.error = null;
      })
      .addCase(approveMaintenance.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        if (action.payload) {
          const idx = state.items.findIndex((item) => (item._id || item.id) === (action.payload._id || action.payload.id));
          if (idx !== -1) {
            state.items[idx] = action.payload;
          }
        }
      })
      .addCase(approveMaintenance.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload;
      });

    // startMaintenance
    builder
      .addCase(startMaintenance.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg;
        state.error = null;
      })
      .addCase(startMaintenance.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        if (action.payload) {
          const idx = state.items.findIndex((item) => (item._id || item.id) === (action.payload._id || action.payload.id));
          if (idx !== -1) {
            state.items[idx] = action.payload;
          }
        }
      })
      .addCase(startMaintenance.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload;
      });

    // resolveMaintenance
    builder
      .addCase(resolveMaintenance.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(resolveMaintenance.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        if (action.payload) {
          const idx = state.items.findIndex((item) => (item._id || item.id) === (action.payload._id || action.payload.id));
          if (idx !== -1) {
            state.items[idx] = action.payload;
          }
        }
      })
      .addCase(resolveMaintenance.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload;
      });
  },
});

export const { setMaintenanceFilter, clearMaintenanceFilters, clearMaintenanceError } = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
