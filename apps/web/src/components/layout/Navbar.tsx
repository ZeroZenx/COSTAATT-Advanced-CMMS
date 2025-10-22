import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, isAdmin, isSupervisor, isTechnician } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationCenter from '../NotificationCenter';
import { Role } from '../../types/auth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <nav className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">COSTAATT CMMS</h1>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-dark-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>


          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className={`px-2 py-1 rounded-md text-sm font-medium ${
                location.pathname === '/dashboard' 
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/work-orders" 
              className={`px-2 py-1 rounded-md text-sm font-medium ${
                location.pathname === '/work-orders' 
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Orders
            </Link>
            <Link 
              to="/campus-services" 
              className={`px-2 py-1 rounded-md text-sm font-medium ${
                location.pathname === '/campus-services' 
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Campus Services
            </Link>
            {(isAdmin(user) || isSupervisor(user)) && (
              <Link 
                to="/contractors" 
                className={`px-2 py-1 rounded-md text-sm font-medium ${
                  location.pathname === '/contractors' 
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Contractors
              </Link>
            )}
            {isSupervisor(user) && (
              <Link 
                to="/maintenance" 
                className={`px-2 py-1 rounded-md text-sm font-medium ${
                  location.pathname === '/maintenance' 
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Maintenance
              </Link>
            )}
            {isSupervisor(user) && (
              <Link 
                to="/inventory" 
                className={`px-2 py-1 rounded-md text-sm font-medium ${
                  location.pathname === '/inventory' 
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Inventory
              </Link>
            )}
            {isAdmin(user) && (
              <Link 
                to="/users" 
                className={`px-2 py-1 rounded-md text-sm font-medium ${
                  location.pathname === '/users' 
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Users
              </Link>
            )}
            {isAdmin(user) && (
              <Link 
                to="/settings" 
                className={`px-2 py-1 rounded-md text-sm font-medium ${
                  location.pathname === '/settings' 
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Settings
              </Link>
            )}
            <Link 
              to="/reports" 
              className={`px-2 py-1 rounded-md text-sm font-medium ${
                location.pathname === '/reports' 
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Reports
            </Link>
            <Link 
              to="/custom-dashboard" 
              className={`px-2 py-1 rounded-md text-sm font-medium ${
                location.pathname === '/custom-dashboard' 
                  ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Custom
            </Link>
          </div>

          {/* Theme Toggle, Notifications & Profile */}
          <div className="flex items-center space-x-4">
            {/* Notification Center */}
            <NotificationCenter />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-dark-700 transition-colors"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-dark-600 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.displayName?.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.displayName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{user?.department}</div>
              </div>
              <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-dark-700">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-dark-700">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.displayName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role || Role.REQUESTOR)}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
                <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700">
                  Profile Settings
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700"
                >
                  Sign Out
                </button>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-dark-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                to="/dashboard" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/dashboard' 
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/work-orders" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/work-orders' 
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Work Orders
              </Link>
              <Link 
                to="/campus-services" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/campus-services' 
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Campus Services
              </Link>
              {(isAdmin(user) || isSupervisor(user)) && (
                <Link 
                  to="/contractors" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/contractors' 
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Manage Contractors
                </Link>
              )}
              {isSupervisor(user) && (
                <Link 
                  to="/maintenance" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/maintenance' 
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Maintenance
                </Link>
              )}
              {isTechnician(user) && (
                <Link 
                  to="/inventory" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/inventory' 
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Inventory
                </Link>
              )}
              {isAdmin(user) && (
                <Link 
                  to="/users" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/users' 
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Users
                </Link>
              )}
              {isAdmin(user) && (
                <Link 
                  to="/settings" 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/settings' 
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
              )}
              <Link 
                to="/reports" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/reports' 
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reports
              </Link>
              <Link 
                to="/custom-dashboard" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/custom-dashboard' 
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Custom Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
