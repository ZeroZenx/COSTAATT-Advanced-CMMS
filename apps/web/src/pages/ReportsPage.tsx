import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ReportData {
  workOrdersPerMonth: Array<{ month: string; count: number }>;
  preventiveVsCorrective: { preventive: number; corrective: number };
  topIssues: Array<{ category: string; count: number }>;
  inventoryUsage: Array<{ item: string; usage: number }>;
  slaBreaches: number;
  averageResolutionTime: number;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockData: ReportData = {
        workOrdersPerMonth: [
          { month: 'Jan', count: 12 },
          { month: 'Feb', count: 18 },
          { month: 'Mar', count: 15 },
          { month: 'Apr', count: 22 },
          { month: 'May', count: 19 },
          { month: 'Jun', count: 25 },
          { month: 'Jul', count: 28 },
          { month: 'Aug', count: 24 },
          { month: 'Sep', count: 21 },
          { month: 'Oct', count: 26 },
          { month: 'Nov', count: 23 },
          { month: 'Dec', count: 20 }
        ],
        preventiveVsCorrective: {
          preventive: 45,
          corrective: 55
        },
        topIssues: [
          { category: 'HVAC', count: 28 },
          { category: 'Electrical', count: 22 },
          { category: 'Plumbing', count: 18 },
          { category: 'Mechanical', count: 15 },
          { category: 'General', count: 12 }
        ],
        inventoryUsage: [
          { item: 'Air Filters', usage: 45 },
          { item: 'Light Bulbs', usage: 32 },
          { item: 'Electrical Tape', usage: 28 },
          { item: 'Pipe Wrenches', usage: 15 },
          { item: 'Generator Oil', usage: 12 }
        ],
        slaBreaches: 8,
        averageResolutionTime: 2.5
      };
      setReportData(mockData);
    } catch (err) {
      setError('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No report data available</p>
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
              <h1 className="text-3xl font-bold text-gray-900">System Reports</h1>
              <p className="mt-2 text-gray-600">Comprehensive system analytics and insights</p>
            </div>
            <div className="flex space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Export Report
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📋</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Work Orders</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {reportData.workOrdersPerMonth.reduce((sum, item) => sum + item.count, 0)}
                      </dd>
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
                      <span className="text-white text-sm font-bold">⚠️</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">SLA Breaches</dt>
                      <dd className="text-lg font-medium text-gray-900">{reportData.slaBreaches}</dd>
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
                      <span className="text-white text-sm font-bold">⏱️</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Resolution Time</dt>
                      <dd className="text-lg font-medium text-gray-900">{reportData.averageResolutionTime} days</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Preventive Ratio</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {Math.round((reportData.preventiveVsCorrective.preventive / 
                          (reportData.preventiveVsCorrective.preventive + reportData.preventiveVsCorrective.corrective)) * 100)}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Work Orders per Month */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Work Orders per Month</h3>
              <div className="space-y-2">
                {reportData.workOrdersPerMonth.map((item) => (
                  <div key={item.month} className="flex items-center">
                    <div className="w-12 text-sm text-gray-600">{item.month}</div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(item.count / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-8 text-sm text-gray-900">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preventive vs Corrective */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preventive vs Corrective</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">Preventive</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-green-600 h-4 rounded-full" 
                        style={{ width: `${(reportData.preventiveVsCorrective.preventive / 
                          (reportData.preventiveVsCorrective.preventive + reportData.preventiveVsCorrective.corrective)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-900">{reportData.preventiveVsCorrective.preventive}%</div>
                </div>
                <div className="flex items-center">
                  <div className="w-24 text-sm text-gray-600">Corrective</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-red-600 h-4 rounded-full" 
                        style={{ width: `${(reportData.preventiveVsCorrective.corrective / 
                          (reportData.preventiveVsCorrective.preventive + reportData.preventiveVsCorrective.corrective)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-900">{reportData.preventiveVsCorrective.corrective}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Issues and Inventory Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top 5 Issues */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top 5 Most Frequent Issues</h3>
              <div className="space-y-3">
                {reportData.topIssues.map((issue, index) => (
                  <div key={issue.category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{issue.category}</span>
                    </div>
                    <span className="text-sm text-gray-600">{issue.count} issues</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Usage */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Inventory Usage</h3>
              <div className="space-y-3">
                {reportData.inventoryUsage.map((item, index) => (
                  <div key={item.item} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.item}</span>
                    </div>
                    <span className="text-sm text-gray-600">{item.usage} used</span>
                  </div>
                ))}
              </div>
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
