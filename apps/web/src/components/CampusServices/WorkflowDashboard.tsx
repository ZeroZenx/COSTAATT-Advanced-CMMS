import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  DollarSign, 
  TrendingUp,
  FileText,
  Calendar,
  Wrench,
  Star
} from 'lucide-react';

interface WorkflowPhase {
  phase: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

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
  workflowPhases: WorkflowPhase[];
  contractorAssignments?: any[];
  purchaseOrders?: any[];
  workExecutionLogs?: any[];
  workQualityChecks?: any[];
}

interface WorkflowDashboardProps {
  requests: WorkflowRequest[];
  onViewDetails: (id: string) => void;
  onCreateNew: () => void;
}

const WorkflowDashboard: React.FC<WorkflowDashboardProps> = ({
  requests,
  onViewDetails,
  onCreateNew
}) => {
  const [selectedPhase, setSelectedPhase] = useState<string>('ALL');

  const phases = [
    { key: 'ALL', label: 'All Requests', color: 'bg-gray-500' },
    { key: 'ORIGINATION', label: 'Origination', color: 'bg-blue-500' },
    { key: 'PLANNING', label: 'Planning', color: 'bg-yellow-500' },
    { key: 'SCHEDULING', label: 'Scheduling', color: 'bg-orange-500' },
    { key: 'EXECUTION', label: 'Execution', color: 'bg-purple-500' },
    { key: 'FEEDBACK', label: 'Feedback', color: 'bg-green-500' },
    { key: 'EVALUATION', label: 'Evaluation', color: 'bg-indigo-500' },
  ];

  const getPhaseStatus = (phases: WorkflowPhase[], phase: string) => {
    const phaseData = phases.find(p => p.phase === phase);
    return phaseData?.status || 'PENDING';
  };

  const getPhaseProgress = (phases: WorkflowPhase[]) => {
    const completedPhases = phases.filter(p => p.status === 'COMPLETED').length;
    return (completedPhases / phases.length) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      case 'SKIPPED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = selectedPhase === 'ALL' 
    ? requests 
    : requests.filter(request => 
        request.workflowPhases.some(phase => 
          phase.phase === selectedPhase && phase.status !== 'PENDING'
        )
      );

  const stats = {
    total: requests.length,
    inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
    urgent: requests.filter(r => r.priority === 'URGENT').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Services Work Process</h1>
          <p className="text-gray-600 mt-2">
            Manage maintenance requests through the complete workflow
          </p>
        </div>
        <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
          <FileText className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
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
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
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
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {phases.map(phase => (
              <Button
                key={phase.key}
                variant={selectedPhase === phase.key ? 'default' : 'outline'}
                onClick={() => setSelectedPhase(phase.key)}
                className={`${
                  selectedPhase === phase.key 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${phase.color} mr-2`} />
                {phase.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Requests */}
      <div className="space-y-4">
        {filteredRequests.map(request => (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{request.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Wrench className="w-4 h-4" />
                      {request.workType}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {request.originationSource.replace('_', ' ')}
                    </div>
                    {request.dueDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Due: {new Date(request.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Overall Progress</span>
                      <span>{Math.round(getPhaseProgress(request.workflowPhases))}%</span>
                    </div>
                    <Progress 
                      value={getPhaseProgress(request.workflowPhases)} 
                      className="h-2"
                    />
                  </div>

                  {/* Phase Status */}
                  <div className="grid grid-cols-6 gap-2">
                    {phases.slice(1).map(phase => {
                      const phaseStatus = getPhaseStatus(request.workflowPhases, phase.key);
                      return (
                        <div key={phase.key} className="text-center">
                          <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center ${
                            phaseStatus === 'COMPLETED' ? 'bg-green-500' :
                            phaseStatus === 'IN_PROGRESS' ? 'bg-blue-500' :
                            phaseStatus === 'SKIPPED' ? 'bg-yellow-500' :
                            'bg-gray-300'
                          }`}>
                            {phaseStatus === 'COMPLETED' && <CheckCircle className="w-4 h-4 text-white" />}
                            {phaseStatus === 'IN_PROGRESS' && <Clock className="w-4 h-4 text-white" />}
                            {phaseStatus === 'SKIPPED' && <AlertCircle className="w-4 h-4 text-white" />}
                          </div>
                          <p className="text-xs text-gray-600">{phase.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="ml-6 flex flex-col gap-2">
                  <Button 
                    onClick={() => onViewDetails(request.id)}
                    variant="outline"
                    size="sm"
                  >
                    View Details
                  </Button>
                  
                  {request.workQualityChecks && request.workQualityChecks.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <Star className="w-4 h-4" />
                      Quality Checked
                    </div>
                  )}
                  
                  {request.purchaseOrders && request.purchaseOrders.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <DollarSign className="w-4 h-4" />
                      PO Created
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600 mb-4">
              {selectedPhase === 'ALL' 
                ? 'No workflow requests have been created yet.'
                : `No requests found in the ${phases.find(p => p.key === selectedPhase)?.label} phase.`
              }
            </p>
            <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
              Create First Request
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowDashboard;
