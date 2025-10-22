import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Mail,
  Calendar,
  Users,
  DollarSign,
  Star
} from 'lucide-react';

interface AnalyticsData {
  period: number;
  workOrderStats: {
    total: number;
    completed: number;
    completionRate: number;
    avgCompletionTime: number;
    statusDistribution: Array<{ status: string; _count: { id: number } }>;
    priorityDistribution: Array<{ priority: string; _count: { id: number } }>;
  };
  categoryPerformance: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
    avgDuration: number;
  }>;
  contractorPerformance: Array<{
    vendorId: string;
    vendorName: string;
    vendorEmail: string;
    avgRating: number;
    avgResponseTime: number;
    avgQuality: number;
    totalRecords: number;
  }>;
  slaBreaches: number;
  recentActivity: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    createdBy: { displayName: string };
    assignedTo: { displayName: string };
    category: { name: string };
  }>;
  monthlyTrends: Array<{
    month: string;
    monthName: string;
    stats: Array<{ status: string; _count: { id: number } }>;
    total: number;
  }>;
  generatedAt: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://10.2.1.27:4000/api/v1'}/analytics/dashboard?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch analytics');
      
      const data = await response.json();
      setAnalyticsData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://10.2.1.27:4000/api/v1'}/analytics/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportType: 'monthly',
          format: reportFormat,
          emailTo: emailRecipients,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to generate report');
      
      const data = await response.json();
      alert(`Report generated successfully! Report ID: ${data.data.reportId}`);
    } catch (err) {
      alert('Failed to generate report: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const addEmailRecipient = () => {
    if (newEmail && !emailRecipients.includes(newEmail)) {
      setEmailRecipients([...emailRecipients, newEmail]);
      setNewEmail('');
    }
  };

  const removeEmailRecipient = (email: string) => {
    setEmailRecipients(emailRecipients.filter(e => e !== email));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchAnalytics} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-600">No data available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Performance metrics and reporting</p>
        </div>
        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Work Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.workOrderStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.workOrderStats.completionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Completion Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.workOrderStats.avgCompletionTime.toFixed(1)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">SLA Breaches</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.slaBreaches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.workOrderStats.statusDistribution.map((stat) => (
                <div key={stat.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      stat.status === 'COMPLETED' ? 'bg-green-500' :
                      stat.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                      stat.status === 'OPEN' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium">{stat.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{stat._count.id}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(stat._count.id / analyticsData.workOrderStats.total) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.workOrderStats.priorityDistribution.map((stat) => (
                <div key={stat.priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      stat.priority === 'URGENT' ? 'bg-red-500' :
                      stat.priority === 'HIGH' ? 'bg-orange-500' :
                      stat.priority === 'MEDIUM' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <span className="text-sm font-medium">{stat.priority}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{stat._count.id}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(stat._count.id / analyticsData.workOrderStats.total) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.categoryPerformance.map((category) => (
              <div key={category.categoryId} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{category.categoryName}</h4>
                  <p className="text-sm text-gray-600">{category.count} work orders</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{category.avgDuration.toFixed(1)}h avg</p>
                  <p className="text-xs text-gray-600">completion time</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contractor Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Contractor Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.contractorPerformance.map((contractor) => (
              <div key={contractor.vendorId} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{contractor.vendorName}</h4>
                  <p className="text-sm text-gray-600">{contractor.vendorEmail}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium">{contractor.avgRating.toFixed(1)}/5</p>
                    <p className="text-xs text-gray-600">rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{contractor.avgResponseTime.toFixed(1)}h</p>
                    <p className="text-xs text-gray-600">response</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{contractor.totalRecords}</p>
                    <p className="text-xs text-gray-600">records</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.monthlyTrends.slice(-6).map((trend) => (
              <div key={trend.month} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{trend.monthName}</h4>
                  <p className="text-sm text-gray-600">{trend.total} total requests</p>
                </div>
                <div className="flex items-center gap-4">
                  {trend.stats.map((stat) => (
                    <div key={stat.status} className="text-center">
                      <p className="text-sm font-medium">{stat._count.id}</p>
                      <p className="text-xs text-gray-600">{stat.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select value={reportFormat} onValueChange={setReportFormat}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={generateReport} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Recipients (optional)</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={addEmailRecipient} variant="outline">
                  Add
                </Button>
              </div>
              {emailRecipients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {emailRecipients.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <button
                        onClick={() => removeEmailRecipient(email)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
