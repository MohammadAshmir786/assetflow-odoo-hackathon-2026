import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch } from './store/hooks';
import { restoreAuth } from './features/auth/authSlice';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Auth/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Assets } from './pages/Assets/Assets';
import { Transfers } from './pages/Transfers/Transfers';
import { Maintenance } from './pages/Maintenance/Maintenance';

import ToastContainer from './components/common/ToastContainer';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/maintenance" element={<Maintenance />} />
          </Route>
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App
