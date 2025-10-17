import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types/auth';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  department?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@costaatt.edu.tt',
          displayName: 'System Administrator',
          role: Role.ADMIN,
          department: 'IT',
          phone: '+1-868-555-0100',
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: '2',
          email: 'supervisor@costaatt.edu.tt',
          displayName: 'Maintenance Supervisor',
          role: Role.SUPERVISOR,
          department: 'Facilities',
          phone: '+1-868-555-0101',
          isActive: true,
          createdAt: '2025-01-02T00:00:00Z'
        },
        {
          id: '3',
          email: 'technician1@costaatt.edu.tt',
          displayName: 'John Doe',
          role: Role.TECHNICIAN,
          department: 'Facilities',
          phone: '+1-868-555-0102',
          isActive: true,
          createdAt: '2025-01-03T00:00:00Z'
        },
        {
          id: '4',
          email: 'technician2@costaatt.edu.tt',
          displayName: 'Mike Johnson',
          role: Role.TECHNICIAN,
          department: 'Facilities',
          phone: '+1-868-555-0103',
          isActive: true,
          createdAt: '2025-01-04T00:00:00Z'
        },
        {
          id: '5',
          email: 'requestor1@costaatt.edu.tt',
          displayName: 'Jane Smith',
          role: Role.REQUESTOR,
          department: 'Administration',
          phone: '+1-868-555-0104',
          isActive: true,
          createdAt: '2025-01-05T00:00:00Z'
        },
        {
          id: '6',
          email: 'inactive@costaatt.edu.tt',
          displayName: 'Inactive User',
          role: Role.REQUESTOR,
          department: 'Administration',
          phone: '+1-868-555-0105',
          isActive: false,
          createdAt: '2025-01-06T00:00:00Z'
        }
      ];
      setUsers(mockUsers);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN: return 'bg-red-100 text-red-800';
      case Role.SUPERVISOR: return 'bg-blue-100 text-blue-800';
      case Role.TECHNICIAN: return 'bg-green-100 text-green-800';
      case Role.REQUESTOR: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'active') return user.isActive;
    if (filter === 'inactive') return !user.isActive;
    return true;
  });

  const activeUsersCount = users.filter(user => user.isActive).length;
  const inactiveUsersCount = users.filter(user => !user.isActive).length;
  const adminCount = users.filter(user => user.role === Role.ADMIN).length;
  const supervisorCount = users.filter(user => user.role === Role.SUPERVISOR).length;
  const technicianCount = users.filter(user => user.role === Role.TECHNICIAN).length;
  const requestorCount = users.filter(user => user.role === Role.REQUESTOR).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-2 text-gray-600">Manage system users and roles</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add User
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{users.length}</dd>
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
                      <span className="text-white text-sm font-bold">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                      <dd className="text-lg font-medium text-gray-900">{activeUsersCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">👑</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Admins</dt>
                      <dd className="text-lg font-medium text-gray-900">{adminCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">👨‍💼</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Supervisors</dt>
                      <dd className="text-lg font-medium text-gray-900">{supervisorCount}</dd>
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
                      <span className="text-white text-sm font-bold">🔧</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Technicians</dt>
                      <dd className="text-lg font-medium text-gray-900">{technicianCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📝</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Requestors</dt>
                      <dd className="text-lg font-medium text-gray-900">{requestorCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex space-x-4">
              {['all', 'active', 'inactive'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === filterType
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Users ({filteredUsers.length})
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {filteredUsers.map((userItem) => (
                  <li key={userItem.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-lg font-medium text-gray-900">
                              {userItem.displayName}
                            </h4>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userItem.role)}`}>
                              {userItem.role}
                            </span>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userItem.isActive)}`}>
                              {userItem.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{userItem.email}</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            {userItem.department && (
                              <span className="mr-4">🏢 Department: {userItem.department}</span>
                            )}
                            {userItem.phone && (
                              <span className="mr-4">📞 Phone: {userItem.phone}</span>
                            )}
                            <span className="mr-4">📅 Created: {new Date(userItem.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                            {userItem.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
