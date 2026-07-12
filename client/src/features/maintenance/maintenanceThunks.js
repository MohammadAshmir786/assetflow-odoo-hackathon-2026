import { createAsyncThunk } from '@reduxjs/toolkit';
import * as maintenanceService from '../../services/maintenanceService';
import { addNotification } from '../notifications/notificationsSlice';
import { fetchAssets } from '../assets/assetsThunks';
import { fetchDashboardStats } from '../dashboard/dashboardThunks';

export const fetchMaintenance = createAsyncThunk(
  'maintenance/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await maintenanceService.getMaintenance(params);
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch maintenance logs');
    }
  }
);

export const createMaintenance = createAsyncThunk(
  'maintenance/create',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await maintenanceService.createMaintenance(data);
      const newLog = res.data?.data ?? res.data;
      dispatch(addNotification({ type: 'success', message: 'Maintenance ticket created successfully' }));
      dispatch(fetchAssets());
      dispatch(fetchDashboardStats());
      return newLog;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create maintenance ticket';
      dispatch(addNotification({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const approveMaintenance = createAsyncThunk(
  'maintenance/approve',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await maintenanceService.approveMaintenance(id);
      const updated = res.data?.data ?? res.data;
      dispatch(addNotification({ type: 'success', message: 'Maintenance approved successfully' }));
      dispatch(fetchAssets());
      dispatch(fetchDashboardStats());
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to approve maintenance';
      dispatch(addNotification({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const startMaintenance = createAsyncThunk(
  'maintenance/start',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await maintenanceService.startMaintenance(id);
      const updated = res.data?.data ?? res.data;
      dispatch(addNotification({ type: 'success', message: 'Maintenance work started' }));
      dispatch(fetchAssets());
      dispatch(fetchDashboardStats());
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to start maintenance';
      dispatch(addNotification({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const resolveMaintenance = createAsyncThunk(
  'maintenance/resolve',
  async ({ id, resolutionNotes }, { dispatch, rejectWithValue }) => {
    try {
      const res = await maintenanceService.resolveMaintenance(id, { resolutionNotes });
      const updated = res.data?.data ?? res.data;
      dispatch(addNotification({ type: 'success', message: 'Maintenance ticket resolved' }));
      dispatch(fetchAssets());
      dispatch(fetchDashboardStats());
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resolve maintenance';
      dispatch(addNotification({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);
