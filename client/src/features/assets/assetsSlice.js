import { createSlice } from '@reduxjs/toolkit';
import { fetchAssets, fetchAssetById, createAsset, updateAsset, allocateAsset, returnAsset } from './assetsThunks';

const initialState = {
  items: [],
  selectedAsset: null,
  loading: false,
  submitting: false,
  error: null,
  submitError: null,
  filters: {
    search: '',
    status: 'All',
    category: 'All',
  },
};

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearAssetError: (state) => {
      state.error = null;
      state.submitError = null;
    },
    clearSelectedAsset: (state) => {
      state.selectedAsset = null;
    },
    // Optimistically update an item in the list after action
    _patchItem: (state, action) => {
      const updated = action.payload;
      const idx = state.items.findIndex((i) => i._id === updated._id || i.id === updated.id);
      if (idx !== -1) state.items[idx] = updated;
    },
  },
  extraReducers: (builder) => {
    // fetchAssets
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        // Backend may return array directly or { assets: [...] }
        const payload = action.payload;
        state.items = Array.isArray(payload) ? payload : (payload?.assets ?? payload?.items ?? []);
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load assets';
      });

    // fetchAssetById
    builder
      .addCase(fetchAssetById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAsset = action.payload;
      })
      .addCase(fetchAssetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // createAsset
    builder
      .addCase(createAsset.pending, (state) => { state.submitting = true; state.submitError = null; })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) state.items.unshift(action.payload);
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });

    // updateAsset
    builder
      .addCase(updateAsset.pending, (state) => { state.submitting = true; state.submitError = null; })
      .addCase(updateAsset.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          const idx = state.items.findIndex((i) => (i._id || i.id) === (action.payload._id || action.payload.id));
          if (idx !== -1) state.items[idx] = action.payload;
          if (state.selectedAsset && (state.selectedAsset._id || state.selectedAsset.id) === (action.payload._id || action.payload.id)) {
            state.selectedAsset = action.payload;
          }
        }
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });

    // allocateAsset
    builder
      .addCase(allocateAsset.pending, (state) => { state.submitting = true; state.submitError = null; })
      .addCase(allocateAsset.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          const idx = state.items.findIndex((i) => (i._id || i.id) === (action.payload._id || action.payload.id));
          if (idx !== -1) state.items[idx] = action.payload;
          if (state.selectedAsset) state.selectedAsset = action.payload;
        }
      })
      .addCase(allocateAsset.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });

    // returnAsset
    builder
      .addCase(returnAsset.pending, (state) => { state.submitting = true; state.submitError = null; })
      .addCase(returnAsset.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          const idx = state.items.findIndex((i) => (i._id || i.id) === (action.payload._id || action.payload.id));
          if (idx !== -1) state.items[idx] = action.payload;
        }
      })
      .addCase(returnAsset.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });
  },
});

export const { setFilter, clearFilters, clearAssetError, clearSelectedAsset, _patchItem } = assetsSlice.actions;
export default assetsSlice.reducer;
