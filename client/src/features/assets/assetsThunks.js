import { createAsyncThunk } from '@reduxjs/toolkit';
import * as assetService from '../../services/assetService';

export const fetchAssets = createAsyncThunk('assets/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await assetService.getAssets(params);
    return res.data?.data ?? res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch assets');
  }
});

export const fetchAssetById = createAsyncThunk('assets/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await assetService.getAssetById(id);
    return res.data?.data ?? res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to fetch asset');
  }
});

export const createAsset = createAsyncThunk('assets/create', async (data, { rejectWithValue }) => {
  try {
    const res = await assetService.createAsset(data);
    return res.data?.data ?? res.data;
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message || 'Failed to create asset';
    return rejectWithValue({ message, status });
  }
});

export const updateAsset = createAsyncThunk('assets/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await assetService.updateAsset(id, data);
    return res.data?.data ?? res.data;
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message || 'Failed to update asset';
    return rejectWithValue({ message, status });
  }
});

export const allocateAsset = createAsyncThunk('assets/allocate', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await assetService.allocateAsset(id, payload);
    return res.data?.data ?? res.data;
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message || 'Failed to allocate asset';
    return rejectWithValue({ message, status });
  }
});

export const returnAsset = createAsyncThunk('assets/return', async (id, { rejectWithValue }) => {
  try {
    const res = await assetService.returnAsset(id);
    return res.data?.data ?? res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Failed to return asset');
  }
});
