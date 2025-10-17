export enum Role {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  TECHNICIAN = 'TECHNICIAN',
  REQUESTOR = 'REQUESTOR',
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  department?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  role: Role;
  department?: string;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}
