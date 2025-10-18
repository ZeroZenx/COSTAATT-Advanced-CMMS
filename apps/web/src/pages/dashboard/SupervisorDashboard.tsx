import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface TeamMember {
  id: string;
  displayName: string;
  email: string;
  role: string;
  activeWorkOrders: number;
  completionRate: number;
  avgResponseTime: number;
}

interface WorkOrderStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [workOrderStats, setWorkOrderStats] = useState<WorkOrderStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch team members
      const teamResponse = await fetch('/api/v1/users?role=TECHNICIAN&department=' + encodeURIComponent(user?.department || ''), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        setTeamMembers(teamData.data.map((member: any) => ({
          ...member,
          activeWorkOrders: Math.floor(Math.random() * 5), // Mock data
          completionRate: Math.floor(Math.random() * 20) + 80, // 80-100%
          avgResponseTime: Math.floor(Math.random() * 4) + 1, // 1-4 hours
        })));
      }

      // Fetch work order stats
      const statsResponse = await fetch('/api/v1/work-orders/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setWorkOrderStats({
          total: statsData.data.total,
          open: statsData.data.open,
          inProgress: statsData.data.inProgress,
          completed: statsData.data.completed,
          overdue: Math.floor(Math.random() * 3), // Mock overdue count
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.displayName}</p>
              <p className="text-sm text-gray-500">Department: {user?.department}</p>
            </div>
            <div className="text-sm text-gray-500">
              Role: <span className="text-green-600 font-medium">{user?.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Link to="/work-orders" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">📋</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Work Orders</dt>
                      <dd className="text-lg font-medium text-gray-900">{workOrderStats.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/work-orders?filter=open" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">⏳</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Open</dt>
                      <dd className="text-lg font-medium text-gray-900">{workOrderStats.open}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/work-orders?filter=in_progress" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">🔧</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                      <dd className="text-lg font-medium text-gray-900">{workOrderStats.inProgress}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/work-orders?filter=completed" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                      <dd className="text-lg font-medium text-gray-900">{workOrderStats.completed}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">⚠️</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                      <dd className="text-lg font-medium text-gray-900">{workOrderStats.overdue}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/work-orders/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center">
                Create Work Order
              </Link>
              <Link to="/maintenance" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-center">
                Schedule Maintenance
              </Link>
              <Link to="/reports" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-center">
                View Reports
              </Link>
              <Link to="/analytics" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-center">
                Analytics
              </Link>
            </div>
          </div>

          {/* Team Management and Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Team Members */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                <span className="text-sm text-gray-500">{teamMembers.length} technicians</span>
              </div>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-700">
                          {member.displayName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.displayName}</p>
                        <p className="text-xs text-gray-500">{member.activeWorkOrders} active work orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{member.completionRate}%</p>
                      <p className="text-xs text-gray-500">Completion Rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Team Performance</h3>
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Average Response Time</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {teamMembers.length > 0 
                        ? Math.round(teamMembers.reduce((sum, member) => sum + member.avgResponseTime, 0) / teamMembers.length * 10) / 10
                        : 0
                      }h
                    </span>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900">Team Completion Rate</span>
                    <span className="text-2xl font-bold text-green-600">
                      {teamMembers.length > 0 
                        ? Math.round(teamMembers.reduce((sum, member) => sum + member.completionRate, 0) / teamMembers.length)
                        : 0
                      }%
                    </span>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-900">Active Work Orders</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {teamMembers.reduce((sum, member) => sum + member.activeWorkOrders, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Work Order #WO-001 completed by John Doe</p>
                    <p className="text-xs text-gray-500">HVAC Repair - Room 101 • 2 hours ago</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Completed
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New work order assigned to Mike Johnson</p>
                    <p className="text-xs text-gray-500">Light Fixture Replacement • 4 hours ago</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  In Progress
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">High priority work order created</p>
                    <p className="text-xs text-gray-500">Plumbing Issue - Lab 2 • 6 hours ago</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  High Priority
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}