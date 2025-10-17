import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, AuthContextType, Role } from '../types/auth';
import { authApi } from '../services/authApi';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.log('No authenticated user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const userData = await authApi.login(credentials);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper functions for role-based access
export function hasRole(user: User | null, allowedRoles: Role[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, [Role.ADMIN]);
}

export function isSupervisor(user: User | null): boolean {
  return hasRole(user, [Role.ADMIN, Role.SUPERVISOR]);
}

export function isTechnician(user: User | null): boolean {
  return hasRole(user, [Role.ADMIN, Role.SUPERVISOR, Role.TECHNICIAN]);
}

export function canCreateWorkOrders(user: User | null): boolean {
  return hasRole(user, [Role.ADMIN, Role.SUPERVISOR, Role.REQUESTOR]);
}

export function canAssignWorkOrders(user: User | null): boolean {
  return hasRole(user, [Role.ADMIN, Role.SUPERVISOR]);
}

export function canManageUsers(user: User | null): boolean {
  return hasRole(user, [Role.ADMIN]);
}
