import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { DashboardProvider } from './contexts/DashboardContext';
// import { MicrosoftAuthProvider } from './contexts/MicrosoftAuthContext'; // Temporarily disabled
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
import SettingsPage from './pages/SettingsPage';
import CustomizableDashboard from './components/dashboard/CustomizableDashboard';
import TestPage from './pages/TestPage';
import TestLogin from './pages/TestLogin';
import SimpleTest from './pages/SimpleTest';
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
      <ThemeProvider>
        <NotificationProvider>
          <DashboardProvider>
            {/* <MicrosoftAuthProvider> */}
              <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-100 dark:bg-dark-900">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/test-login" element={<TestLogin />} />
              <Route path="/simple-test" element={<SimpleTest />} />
              
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
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={[Role.ADMIN]}>
                    <Navbar />
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/custom-dashboard"
                element={
                  <ProtectedRoute>
                    <Navbar />
                    <CustomizableDashboard />
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
            {/* </MicrosoftAuthProvider> */}
          </DashboardProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
