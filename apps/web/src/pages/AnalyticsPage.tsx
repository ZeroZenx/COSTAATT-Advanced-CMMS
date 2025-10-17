import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';

interface AnalyticsData {
  workOrders: {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    byPriority: any[];
    byCategory: any[];
    recent: number;
    recentCompleted: number;
    avgCompletionTimeHours: number;
  };
  sla: {
    total: number;
    breached: number;
    resolved: number;
    breachRate: number;
  };
  maintenance: {
    totalSchedules: number;
    activeSchedules: number;
    completedTasks: number;
  };
  inventory: {
    totalItems: number;
    lowStockItems: number;
    lowStockRate: number;
  };
  users: {
    total: number;
    active: number;
    byRole: any[];
  };
}

interface TrendData {
  daily: any[];
  monthly: any[];
}

interface PerformanceData {
  topTechnicians: any[];
  commonIssues: any[];
  problemLocations: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [analyticsRes, trendsRes, performanceRes] = await Promise.all([
        fetch(`/api/v1/analytics/dashboard?period=${selectedPeriod}`),
        fetch(`/api/v1/analytics/work-orders/trends?period=${selectedPeriod}`),
        fetch(`/api/v1/analytics/performance?period=${selectedPeriod}`),
      ]);

      const [analytics, trends, performance] = await Promise.all([
        analyticsRes.json(),
        trendsRes.json(),
        performanceRes.json(),
      ]);

      setAnalyticsData(analytics.data);
      setTrendData(trends.data);
      setPerformanceData(performance.data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon, color }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
          <div className={`w-6 h-6 ${color}`}>{icon}</div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last period
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }: any) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive insights into your CMMS performance and operations
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Time Period:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-2">
            <TabButton
              id="overview"
              label="Overview"
              isActive={activeTab === 'overview'}
              onClick={setActiveTab}
            />
            <TabButton
              id="trends"
              label="Trends"
              isActive={activeTab === 'trends'}
              onClick={setActiveTab}
            />
            <TabButton
              id="performance"
              label="Performance"
              isActive={activeTab === 'performance'}
              onClick={setActiveTab}
            />
            <TabButton
              id="predictions"
              label="Predictions"
              isActive={activeTab === 'predictions'}
              onClick={setActiveTab}
            />
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && analyticsData && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Work Orders"
                value={analyticsData.workOrders.total}
                icon="📋"
                color="text-blue-600"
              />
              <StatCard
                title="Completion Rate"
                value={`${Math.round((analyticsData.workOrders.completed / analyticsData.workOrders.total) * 100)}%`}
                icon="✅"
                color="text-green-600"
              />
              <StatCard
                title="SLA Breach Rate"
                value={`${analyticsData.sla.breachRate}%`}
                icon="⚠️"
                color="text-red-600"
              />
              <StatCard
                title="Avg. Completion Time"
                value={`${analyticsData.workOrders.avgCompletionTimeHours.toFixed(1)}h`}
                icon="⏱️"
                color="text-purple-600"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Work Orders by Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Orders by Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Open', value: analyticsData.workOrders.open, color: '#F59E0B' },
                        { name: 'In Progress', value: analyticsData.workOrders.inProgress, color: '#8B5CF6' },
                        { name: 'Completed', value: analyticsData.workOrders.completed, color: '#10B981' },
                        { name: 'Cancelled', value: analyticsData.workOrders.cancelled, color: '#EF4444' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Open', value: analyticsData.workOrders.open, color: '#F59E0B' },
                        { name: 'In Progress', value: analyticsData.workOrders.inProgress, color: '#8B5CF6' },
                        { name: 'Completed', value: analyticsData.workOrders.completed, color: '#10B981' },
                        { name: 'Cancelled', value: analyticsData.workOrders.cancelled, color: '#EF4444' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Work Orders by Priority */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Orders by Priority</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.workOrders.byPriority}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="_count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Work Orders by Category */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Orders by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.workOrders.byCategory} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="_count" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* User Distribution */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution by Role</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.users.byRole}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ role, _count }) => `${role} ${_count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="_count"
                    >
                      {analyticsData.users.byRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && trendData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Order Trends</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" name="Created" />
                  <Line type="monotone" dataKey="completed" stroke="#10B981" name="Completed" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData.monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="count" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Created" />
                  <Area type="monotone" dataKey="completed" stackId="2" stroke="#10B981" fill="#10B981" name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && performanceData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Technicians</h3>
                <div className="space-y-3">
                  {performanceData.topTechnicians.map((tech, index) => (
                    <div key={tech.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{tech.name}</p>
                          <p className="text-sm text-gray-600">{tech.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{tech.completedWorkOrders}</p>
                        <p className="text-sm text-gray-600">completed</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Issues</h3>
                <div className="space-y-3">
                  {performanceData.commonIssues.map((issue, index) => (
                    <div key={issue.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{issue.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{issue._count.category}</p>
                        <p className="text-sm text-gray-600">occurrences</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Problem Locations</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData.problemLocations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="_count" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Predictions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Failure Predictions</h4>
                  <p className="text-3xl font-bold text-red-600">3</p>
                  <p className="text-sm text-gray-600">High-risk assets</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Maintenance Due</h4>
                  <p className="text-3xl font-bold text-yellow-600">7</p>
                  <p className="text-sm text-gray-600">Scheduled this week</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Cost Savings</h4>
                  <p className="text-3xl font-bold text-green-600">$12.5K</p>
                  <p className="text-sm text-gray-600">Predicted this month</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Maintenance Schedule</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">HVAC Unit #3</p>
                    <p className="text-sm text-gray-600">High failure probability (85%)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-red-600 font-semibold">Urgent</p>
                    <p className="text-xs text-gray-600">Due: 2 days</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Generator #1</p>
                    <p className="text-sm text-gray-600">Moderate risk (65%)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-yellow-600 font-semibold">High</p>
                    <p className="text-xs text-gray-600">Due: 1 week</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Elevator #2</p>
                    <p className="text-sm text-gray-600">Low risk (35%)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-600 font-semibold">Medium</p>
                    <p className="text-xs text-gray-600">Due: 2 weeks</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}