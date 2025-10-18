import React, { useState } from 'react';

export default function SimpleTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing API connection...');
    
    try {
      // Test 1: Health check
      const healthResponse = await fetch('http://localhost:4000/health');
      const healthData = await healthResponse.json();
      
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      
      setResult(`✅ Health check passed: ${JSON.stringify(healthData)}`);
      
      // Test 2: Login
      const loginResponse = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@costaatt.edu.tt',
          password: 'Admin@123'
        }),
      });
      
      const loginData = await loginResponse.json();
      
      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status} - ${JSON.stringify(loginData)}`);
      }
      
      setResult(`✅ Both tests passed!\nHealth: ${JSON.stringify(healthData)}\nLogin: ${loginData.data.displayName} (${loginData.data.role})`);
      
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">API Connection Test</h1>
        
        <button
          onClick={testAPI}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        {result && (
          <div className={`mt-4 p-3 rounded-md text-sm whitespace-pre-line ${
            result.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
