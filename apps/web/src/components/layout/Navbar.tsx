import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, isAdmin, isSupervisor, isTechnician } from '../../contexts/AuthContext';
import { Role } from '../../types/auth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'text-purple-600 bg-purple-100';
      case Role.SUPERVISOR:
        return 'text-blue-600 bg-blue-100';
      case Role.TECHNICIAN:
        return 'text-green-600 bg-green-100';
      case Role.REQUESTOR:
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">COSTAATT CMMS</h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/dashboard' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/work-orders" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/work-orders' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Work Orders
            </Link>
            {isSupervisor(user) && (
              <Link 
                to="/maintenance" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/maintenance' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Maintenance
              </Link>
            )}
            {isSupervisor(user) && (
              <Link 
                to="/inventory" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/inventory' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Inventory
              </Link>
            )}
            {isAdmin(user) && (
              <Link 
                to="/users" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/users' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Users
              </Link>
            )}
            <Link 
              to="/reports" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/reports' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Reports
            </Link>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user?.displayName?.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900">{user?.displayName}</div>
                <div className="text-xs text-gray-500">{user?.department}</div>
              </div>
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-900">{user?.displayName}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role || Role.REQUESTOR)}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile Settings
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
