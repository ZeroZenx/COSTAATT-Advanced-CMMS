import React, { useState } from 'react';

export default function TestLogin() {
  const [email, setEmail] = useState('admin@costaatt.edu.tt');
  const [password, setPassword] = useState('Admin@123');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ SUCCESS! Logged in as: ${data.data.displayName} (${data.data.role})`);
        localStorage.setItem('token', data.data.token);
      } else {
        setResult(`❌ ERROR: ${data.error || 'Login failed'}`);
      }
    } catch (error: any) {
      setResult(`❌ NETWORK ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testMe = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setResult('❌ No token found. Please login first.');
      return;
    }

    setLoading(true);
    setResult('Testing /me endpoint...');
    
    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ SUCCESS! Current user: ${data.data.displayName} (${data.data.role})`);
      } else {
        setResult(`❌ ERROR: ${data.error || 'Failed to get user'}`);
      }
    } catch (error: any) {
      setResult(`❌ NETWORK ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">API Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={testLogin}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
            
            <button
              onClick={testMe}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Test /me
            </button>
          </div>
          
          {result && (
            <div className={`p-3 rounded-md text-sm ${
              result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
