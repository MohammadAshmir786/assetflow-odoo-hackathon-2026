import api from './api';

export const getAssets = (params) => api.get('/assets', { params });
export const getAssetById = (id) => api.get(`/assets/${id}`);
export const createAsset = (data) => api.post('/assets', data);
export const updateAsset = (id, data) => api.put(`/assets/${id}`, data);
export const allocateAsset = (id, payload) => api.post(`/assets/${id}/allocate`, payload);
export const returnAsset = (id) => api.post(`/assets/${id}/return`);

const assetService = { getAssets, getAssetById, createAsset, updateAsset, allocateAsset, returnAsset };
export default assetService;
