import api from './api';

export const getTransfers     = (params)     => api.get('/transfers', { params });
export const createTransfer   = (data)       => api.post('/transfers', data);
export const approveTransfer  = (id)         => api.patch(`/transfers/${id}/approve`);
export const rejectTransfer   = (id, data)   => api.patch(`/transfers/${id}/reject`, data);

const transferService = { getTransfers, createTransfer, approveTransfer, rejectTransfer };
export default transferService;
