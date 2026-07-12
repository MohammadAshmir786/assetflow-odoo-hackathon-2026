import { createSelector } from '@reduxjs/toolkit';

export const selectMaintenanceItems = (state) => state.maintenance.items;
export const selectMaintenanceLoading = (state) => state.maintenance.loading;
export const selectMaintenanceSubmitting = (state) => state.maintenance.submitting;
export const selectMaintenanceActionLoadingId = (state) => state.maintenance.actionLoadingId;
export const selectMaintenanceError = (state) => state.maintenance.error;
export const selectMaintenanceFilters = (state) => state.maintenance.filters;

export const selectFilteredMaintenance = createSelector(
  [selectMaintenanceItems, selectMaintenanceFilters],
  (items, filters) => {
    const search = (filters.search || '').toLowerCase().trim();
    return items.filter((item) => {
      const matchSearch =
        !search ||
        item.asset?.name?.toLowerCase().includes(search) ||
        item.asset?.assetTag?.toLowerCase().includes(search) ||
        item.issueDescription?.toLowerCase().includes(search) ||
        item.requestedBy?.name?.toLowerCase().includes(search);
      
      const matchStatus = !filters.status || filters.status === 'All' || item.status === filters.status;
      const matchPriority = !filters.priority || filters.priority === 'All' || item.priority === filters.priority;
      
      return matchSearch && matchStatus && matchPriority;
    });
  }
);
