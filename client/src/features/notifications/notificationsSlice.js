import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
      state.notifications.push({
        id,
        type: action.payload.type || 'info',
        message: action.payload.message || '',
        duration: action.payload.duration !== undefined ? action.payload.duration : 4000,
      });
    },
    dismissNotification: (state, action) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
  },
});

export const { addNotification, dismissNotification } = notificationsSlice.actions;
export const selectNotifications = (state) => state.notifications.notifications;
export default notificationsSlice.reducer;
