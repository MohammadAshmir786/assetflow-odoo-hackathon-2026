import { createSlice } from '@reduxjs/toolkit';
import { fetchTransfers, createTransfer, approveTransfer, rejectTransfer } from './transfersThunks';

const initialState = {
  items: [],
  loading: false,
  submitting: false,
  actionLoadingId: null,
  error: null,
  filter: 'All',
};

const transfersSlice = createSlice({
  name: 'transfers',
  initialState,
  reducers: {
    setTransferFilter: (state, action) => {
      state.filter = action.payload;
    },
    clearTransferError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchTransfers
    builder
      .addCase(fetchTransfers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransfers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load transfers';
      });

    // createTransfer
    builder
      .addCase(createTransfer.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createTransfer.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(createTransfer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });

    // approveTransfer
    builder
      .addCase(approveTransfer.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg;
        state.error = null;
      })
      .addCase(approveTransfer.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        if (action.payload) {
          const idx = state.items.findIndex((item) => (item._id || item.id) === (action.payload._id || action.payload.id));
          if (idx !== -1) {
            state.items[idx] = action.payload;
          }
        }
      })
      .addCase(approveTransfer.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload;
      });

    // rejectTransfer
    builder
      .addCase(rejectTransfer.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(rejectTransfer.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        if (action.payload) {
          const idx = state.items.findIndex((item) => (item._id || item.id) === (action.payload._id || action.payload.id));
          if (idx !== -1) {
            state.items[idx] = action.payload;
          }
        }
      })
      .addCase(rejectTransfer.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload;
      });
  },
});

export const { setTransferFilter, clearTransferError } = transfersSlice.actions;
export default transfersSlice.reducer;
