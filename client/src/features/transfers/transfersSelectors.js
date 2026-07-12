import { createSelector } from '@reduxjs/toolkit';

export const selectTransfersItems = (state) => state.transfers.items;
export const selectTransfersLoading = (state) => state.transfers.loading;
export const selectTransfersSubmitting = (state) => state.transfers.submitting;
export const selectTransfersActionLoadingId = (state) => state.transfers.actionLoadingId;
export const selectTransfersError = (state) => state.transfers.error;
export const selectTransfersFilter = (state) => state.transfers.filter;

export const selectFilteredTransfers = createSelector(
  [selectTransfersItems, selectTransfersFilter],
  (items, filter) => {
    if (!filter || filter === 'All') return items;
    return items.filter((item) => item.status?.toLowerCase() === filter.toLowerCase());
  }
);
