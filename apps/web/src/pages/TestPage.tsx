import React, { useState } from 'react';
import { authApi } from '../services/authApi';

export default function TestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      const user = await authApi.login({
        email: 'admin@costaatt.edu.tt',
        password: 'Admin@123'
      });
      setResult(`Login successful: ${JSON.stringify(user, null, 2)}`);
    } catch (error: any) {
      setResult(`Login failed: ${error.message}`);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testMe = async () => {
    setLoading(true);
    setResult('Testing /me endpoint...');
    
    try {
      const user = await authApi.getCurrentUser();
      setResult(`/me successful: ${JSON.stringify(user, null, 2)}`);
    } catch (error: any) {
      setResult(`/me failed: ${error.message}`);
      console.error('/me error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Test Login
          </button>
          
          <button
            onClick={testMe}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 ml-4"
          >
            Test /me
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
            {result || 'No test run yet'}
          </pre>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Environment Info:</h2>
          <pre className="bg-gray-100 p-4 rounded-md">
            {JSON.stringify({
              VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
              NODE_ENV: import.meta.env.NODE_ENV,
              MODE: import.meta.env.MODE
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
