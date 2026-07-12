import { createAsyncThunk } from '@reduxjs/toolkit';
import * as transferService from '../../services/transferService';
import { addNotification } from '../notifications/notificationsSlice';
import { fetchAssets } from '../assets/assetsThunks';
import { fetchDashboardStats } from '../dashboard/dashboardThunks';

export const fetchTransfers = createAsyncThunk(
  'transfers/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await transferService.getTransfers(params);
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch transfers');
    }
  }
);

export const createTransfer = createAsyncThunk(
  'transfers/create',
  async (data, { dispatch, rejectWithValue }) => {
    try {
      const res = await transferService.createTransfer(data);
      const newTransfer = res.data?.data ?? res.data;
      dispatch(addNotification({ type: 'success', message: 'Transfer request created successfully' }));
      dispatch(fetchAssets());
      dispatch(fetchDashboardStats());
      return newTransfer;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create transfer';
      dispatch(addNotification({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const approveTransfer = createAsyncThunk(
  'transfers/approve',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await transferService.approveTransfer(id);
      const updated = res.data?.data ?? res.data;
      dispatch(addNotification({ type: 'success', message: 'Transfer approved successfully' }));
      dispatch(fetchAssets());
      dispatch(fetchDashboardStats());
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to approve transfer';
      dispatch(addNotification({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);

export const rejectTransfer = createAsyncThunk(
  'transfers/reject',
  async ({ id, reason }, { dispatch, rejectWithValue }) => {
    try {
      const res = await transferService.rejectTransfer(id, { reason });
      const updated = res.data?.data ?? res.data;
      dispatch(addNotification({ type: 'success', message: 'Transfer request rejected' }));
      dispatch(fetchAssets());
      dispatch(fetchDashboardStats());
      return updated;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reject transfer';
      dispatch(addNotification({ type: 'error', message: msg }));
      return rejectWithValue(msg);
    }
  }
);
