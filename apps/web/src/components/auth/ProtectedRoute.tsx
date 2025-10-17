import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, hasRole } from '../../contexts/AuthContext';
import { Role } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && !hasRole(user, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
