import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/auth';

export default function LoginPage() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleCredentialClick = (email: string, password: string) => {
    setCredentials({ email, password });
    setError(''); // Clear any previous errors
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">COSTAATT CMMS</h1>
          <p className="mt-2 text-sm text-gray-600">Work Order Management System</p>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={credentials.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Test Credentials</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-gray-600">
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <div 
                  className="cursor-pointer p-2 rounded hover:bg-blue-50 hover:text-blue-700 transition-colors border border-transparent hover:border-blue-200"
                  onClick={() => handleCredentialClick('admin@costaatt.edu.tt', 'Admin@123')}
                >
                  <span className="font-medium text-blue-600">👑 Admin:</span> admin@costaatt.edu.tt / Admin@123
                </div>
                <div 
                  className="cursor-pointer p-2 rounded hover:bg-green-50 hover:text-green-700 transition-colors border border-transparent hover:border-green-200"
                  onClick={() => handleCredentialClick('sup1@costaatt.edu.tt', 'Pass@123')}
                >
                  <span className="font-medium text-green-600">👨‍💼 Supervisor:</span> sup1@costaatt.edu.tt / Pass@123
                </div>
                <div 
                  className="cursor-pointer p-2 rounded hover:bg-orange-50 hover:text-orange-700 transition-colors border border-transparent hover:border-orange-200"
                  onClick={() => handleCredentialClick('tech1@costaatt.edu.tt', 'Pass@123')}
                >
                  <span className="font-medium text-orange-600">🔧 Technician:</span> tech1@costaatt.edu.tt / Pass@123
                </div>
                <div 
                  className="cursor-pointer p-2 rounded hover:bg-purple-50 hover:text-purple-700 transition-colors border border-transparent hover:border-purple-200"
                  onClick={() => handleCredentialClick('staff1@costaatt.edu.tt', 'Pass@123')}
                >
                  <span className="font-medium text-purple-600">👤 Staff:</span> staff1@costaatt.edu.tt / Pass@123
                </div>
              </div>
              <p className="text-center text-gray-500 text-xs mt-2">
                💡 Click any credential above to auto-fill the form
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
