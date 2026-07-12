import api from './api';

export const getMaintenance     = (params) => api.get('/maintenance', { params });
export const createMaintenance   = (data)   => api.post('/maintenance', data);
export const approveMaintenance  = (id)     => api.patch(`/maintenance/${id}/approve`);
export const startMaintenance    = (id)     => api.patch(`/maintenance/${id}/start`);
export const resolveMaintenance  = (id, data) => api.patch(`/maintenance/${id}/resolve`, data);

const maintenanceService = {
  getMaintenance,
  createMaintenance,
  approveMaintenance,
  startMaintenance,
  resolveMaintenance,
};

export default maintenanceService;
