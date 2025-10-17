import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.displayName}</p>
            </div>
            <div className="text-sm text-gray-500">
              Role: <span className="text-purple-600 font-medium">{user?.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                      <dd className="text-lg font-medium text-gray-900">24</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/users" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                      <dd className="text-lg font-medium text-gray-900">12</dd>
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
                      <span className="text-white font-bold">🔧</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Open Orders</dt>
                      <dd className="text-lg font-medium text-gray-900">8</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/reports" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">⚠️</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">SLA Breaches</dt>
                      <dd className="text-lg font-medium text-gray-900">2</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">System Management</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Administrative functions and system controls
                </p>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                              <span className="text-purple-600 font-bold">👤</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">User Management</div>
                            <div className="text-sm text-gray-500">Manage system users and roles</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Link to="/users" className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Manage →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                              <span className="text-green-600 font-bold">📊</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">System Reports</div>
                            <div className="text-sm text-gray-500">View comprehensive system analytics</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Link to="/reports" className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            View →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                              <span className="text-blue-600 font-bold">⚙️</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">System Settings</div>
                            <div className="text-sm text-gray-500">Configure system parameters</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Link to="/settings" className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Configure →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Latest system events and updates
                </p>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">New user registered</p>
                          <p className="text-sm text-gray-500">john.doe@costaatt.edu.tt - 2 hours ago</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            New
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Work order completed</p>
                          <p className="text-sm text-gray-500">AC Unit Repair - 4 hours ago</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">SLA breach detected</p>
                          <p className="text-sm text-gray-500">Plumbing Issue - 6 hours ago</p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Breach
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
