import axios from 'axios';
import { User, LoginCredentials, RegisterData } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await api.post('/api/v1/auth/login', credentials);
    const { data } = response.data;
    
    // Store token in localStorage as backup
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/api/v1/auth/logout');
    localStorage.removeItem('token');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/api/v1/auth/me');
    return response.data.data;
  },

  async register(userData: RegisterData): Promise<User> {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data.data;
  },

  async getUsers(): Promise<User[]> {
    const response = await api.get('/api/v1/auth/users');
    return response.data.data;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await api.patch(`/api/v1/auth/users/${id}`, userData);
    return response.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/api/v1/auth/users/${id}`);
  },
};
