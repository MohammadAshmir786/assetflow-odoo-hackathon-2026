import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import assetsReducer from '../features/assets/assetsSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import transfersReducer from '../features/transfers/transfersSlice';
import maintenanceReducer from '../features/maintenance/maintenanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    assets: assetsReducer,
    notifications: notificationsReducer,
    transfers: transfersReducer,
    maintenance: maintenanceReducer,
  },
});

export default store;
