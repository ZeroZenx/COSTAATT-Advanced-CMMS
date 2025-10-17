import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import { Role } from './types/auth';
import LoginPage from './pages/auth/LoginPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import MaintenancePage from './pages/MaintenancePage';
import InventoryPage from './pages/InventoryPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TestPage from './pages/TestPage';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/test" element={<TestPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/work-orders"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <WorkOrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maintenance"
                element={
                  <ProtectedRoute allowedRoles={[Role.ADMIN, Role.SUPERVISOR, Role.TECHNICIAN]}>
                    <Navbar />
                    <MaintenancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute allowedRoles={[Role.ADMIN, Role.SUPERVISOR, Role.TECHNICIAN]}>
                    <Navbar />
                    <InventoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                    <Navbar />
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={[Role.ADMIN, Role.SUPERVISOR]}>
                    <Navbar />
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute allowedRoles={[Role.ADMIN, Role.SUPERVISOR]}>
                    <Navbar />
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
