import React from 'react';
import { useAuth, isAdmin, isSupervisor, isTechnician } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import SupervisorDashboard from './SupervisorDashboard';
import TechnicianDashboard from './TechnicianDashboard';
import RequestorDashboard from './RequestorDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render role-specific dashboard
  if (isAdmin(user)) {
    return <AdminDashboard />;
  } else if (isSupervisor(user)) {
    return <SupervisorDashboard />;
  } else if (isTechnician(user)) {
    return <TechnicianDashboard />;
  } else {
    return <RequestorDashboard />;
  }
}
