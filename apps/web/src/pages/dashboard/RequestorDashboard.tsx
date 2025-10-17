import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function RequestorDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Requestor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.displayName}</p>
            </div>
            <div className="text-sm text-gray-500">
              Role: <span className="text-gray-600 font-medium">{user?.role}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">📋</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">My Requests</dt>
                      <dd className="text-lg font-medium text-gray-900">5</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
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
                      <dd className="text-lg font-medium text-gray-900">12</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">⏳</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                      <dd className="text-lg font-medium text-gray-900">2</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">My Recent Requests</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Your recent work order requests
                    </p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    New Request
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              IN PROGRESS
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Broken Light in Room 101</div>
                            <div className="text-sm text-gray-500">Main Building - Created 2 days ago</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            View →
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              COMPLETED
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Leaky Faucet in Staff Restroom</div>
                            <div className="text-sm text-gray-500">Main Building - Completed yesterday</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            View →
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Common maintenance requests
                </p>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                              <span className="text-blue-600 font-bold">💡</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Electrical Issue</div>
                            <div className="text-sm text-gray-500">Report lighting or electrical problems</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Report →
                          </button>
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
                              <span className="text-green-600 font-bold">🚰</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">Plumbing Issue</div>
                            <div className="text-sm text-gray-500">Report water or plumbing problems</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Report →
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                              <span className="text-yellow-600 font-bold">❄️</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">HVAC Issue</div>
                            <div className="text-sm text-gray-500">Report heating or cooling problems</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Report →
                          </button>
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
