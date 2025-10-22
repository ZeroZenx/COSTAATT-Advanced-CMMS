import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Workflow, 
  Plus, 
  BarChart3, 
  Settings,
  FileText,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import WorkflowDashboard from '@/components/CampusServices/WorkflowDashboard';
import WorkflowRequestForm from '@/components/CampusServices/WorkflowRequestForm';
import WorkflowRequestDetails from '@/components/CampusServices/WorkflowRequestDetails';

interface WorkflowRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  workType: 'INTERNAL' | 'CONTRACTOR' | 'MIXED';
  originationSource: string;
  location: string;
  createdAt: string;
  dueDate?: string;
  workflowPhases: any[];
  contractorAssignments?: any[];
  purchaseOrders?: any[];
  workExecutionLogs?: any[];
  workQualityChecks?: any[];
}

const CampusServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [workflowRequests, setWorkflowRequests] = useState<WorkflowRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch workflow requests from API
  useEffect(() => {
    const fetchWorkflowRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://10.2.1.27:4000/api/v1'}/campus-services/workflow/requests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch workflow requests');
        
        const data = await response.json();
        setWorkflowRequests(data.data || []);
      } catch (error) {
        console.error('Error fetching workflow requests:', error);
        // Fallback to empty array if API fails
        setWorkflowRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowRequests();
  }, []);

  const handleCreateNew = () => {
    setShowRequestForm(true);
    setSelectedRequest(null);
  };

  const handleViewDetails = (id: string) => {
    setSelectedRequest(id);
    setActiveTab('details');
  };

  const handleSaveRequest = (data: any) => {
    // Handle saving the request
    console.log('Saving request:', data);
    setShowRequestForm(false);
    // Refresh the requests list
  };

  const handleCancelForm = () => {
    setShowRequestForm(false);
    setSelectedRequest(null);
  };

  if (showRequestForm) {
    return (
      <div className="container mx-auto py-6">
        <WorkflowRequestForm
          onSave={handleSaveRequest}
          onCancel={handleCancelForm}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Campus Services Work Process...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Workflow className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campus Services Work Process</h1>
            <p className="text-gray-600">
              Comprehensive 6-phase workflow for maintenance and service requests
            </p>
          </div>
        </div>

        {/* Workflow Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          {[
            { phase: 'ORIGINATION', label: 'Origination', icon: FileText, color: 'bg-blue-500' },
            { phase: 'PLANNING', label: 'Planning', icon: Settings, color: 'bg-yellow-500' },
            { phase: 'SCHEDULING', label: 'Scheduling', icon: Clock, color: 'bg-orange-500' },
            { phase: 'EXECUTION', label: 'Execution', icon: Users, color: 'bg-purple-500' },
            { phase: 'FEEDBACK', label: 'Feedback', icon: CheckCircle, color: 'bg-green-500' },
            { phase: 'EVALUATION', label: 'Evaluation', icon: BarChart3, color: 'bg-indigo-500' },
          ].map(({ phase, label, icon: Icon, color }) => (
            <Card key={phase} className="text-center">
              <CardContent className="p-4">
                <div className={`w-12 h-12 ${color} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900">{label}</h3>
                <p className="text-xs text-gray-600 mt-1">
                  {workflowRequests.filter(req => 
                    req.workflowPhases.some(p => p.phase === phase && p.status !== 'PENDING')
                  ).length} requests
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="contractors">Contractors</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <WorkflowDashboard
            requests={workflowRequests}
            onViewDetails={handleViewDetails}
            onCreateNew={handleCreateNew}
          />
        </TabsContent>

        <TabsContent value="details">
          {selectedRequest ? (
            <WorkflowRequestDetails
              request={workflowRequests.find(r => r.id === selectedRequest)}
              onBack={() => setActiveTab('dashboard')}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Request Selected</h3>
                <p className="text-gray-600 mb-4">
                  Select a request from the dashboard to view its details.
                </p>
                <Button onClick={() => setActiveTab('dashboard')} className="bg-blue-600 hover:bg-blue-700">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Workflow Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600 mb-4">
                  Performance metrics and reporting will be available here
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contractors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Contractor Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Contractor Management</h3>
                <p className="text-gray-600 mb-4">
                  Manage contractors, contracts, and performance tracking
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Manage Contractors
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Workflow Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Workflow Configuration</h3>
                <p className="text-gray-600 mb-4">
                  Configure workflow phases, approval processes, and automation rules
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Configure Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampusServicesPage;
