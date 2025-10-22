import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  DollarSign, 
  TrendingUp,
  FileText,
  Calendar,
  Wrench,
  Star,
  MapPin,
  User,
  Phone,
  Mail,
  Building
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

interface WorkflowRequestDetailsProps {
  request: WorkflowRequest | undefined;
  onBack: () => void;
}

const WorkflowRequestDetails: React.FC<WorkflowRequestDetailsProps> = ({
  request,
  onBack
}) => {
  if (!request) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Request Not Found</h3>
          <p className="text-gray-600 mb-4">
            The selected request could not be found.
          </p>
          <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

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

  const phases = [
    { key: 'ORIGINATION', label: 'Origination', color: 'bg-blue-500', description: 'Request initiation and initial assessment' },
    { key: 'PLANNING', label: 'Planning', color: 'bg-yellow-500', description: 'Resource planning and validation' },
    { key: 'SCHEDULING', label: 'Scheduling', color: 'bg-orange-500', description: 'Resource assignment and authorization' },
    { key: 'EXECUTION', label: 'Execution', color: 'bg-purple-500', description: 'Work performance and documentation' },
    { key: 'FEEDBACK', label: 'Feedback', color: 'bg-green-500', description: 'Quality verification and validation' },
    { key: 'EVALUATION', label: 'Evaluation', color: 'bg-indigo-500', description: 'Performance measurement and reporting' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
          <p className="text-gray-600">Work Order ID: {request.id}</p>
        </div>
      </div>

      {/* Status and Priority */}
      <div className="flex gap-4">
        <Badge className={getPriorityColor(request.priority)}>
          {request.priority} Priority
        </Badge>
        <Badge className={getStatusColor(request.status)}>
          {request.status}
        </Badge>
        <Badge variant="outline">
          {request.workType} Work
        </Badge>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{request.description}</p>
            </CardContent>
          </Card>

          {/* Workflow Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Workflow Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Overall Progress</span>
                  <span>{Math.round(getPhaseProgress(request.workflowPhases))}%</span>
                </div>
                <Progress 
                  value={getPhaseProgress(request.workflowPhases)} 
                  className="h-3"
                />
              </div>

              <div className="space-y-4">
                {phases.map(phase => {
                  const phaseStatus = getPhaseStatus(request.workflowPhases, phase.key);
                  const phaseData = request.workflowPhases.find(p => p.phase === phase.key);
                  
                  return (
                    <div key={phase.key} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        phaseStatus === 'COMPLETED' ? 'bg-green-500' :
                        phaseStatus === 'IN_PROGRESS' ? 'bg-blue-500' :
                        phaseStatus === 'SKIPPED' ? 'bg-yellow-500' :
                        'bg-gray-300'
                      }`}>
                        {phaseStatus === 'COMPLETED' && <CheckCircle className="w-5 h-5 text-white" />}
                        {phaseStatus === 'IN_PROGRESS' && <Clock className="w-5 h-5 text-white" />}
                        {phaseStatus === 'SKIPPED' && <AlertCircle className="w-5 h-5 text-white" />}
                        {phaseStatus === 'PENDING' && <div className="w-3 h-3 bg-white rounded-full" />}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{phase.label}</h4>
                        <p className="text-sm text-gray-600">{phase.description}</p>
                        {phaseData?.startedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Started: {new Date(phaseData.startedAt).toLocaleString()}
                          </p>
                        )}
                        {phaseData?.completedAt && (
                          <p className="text-xs text-gray-500">
                            Completed: {new Date(phaseData.completedAt).toLocaleString()}
                          </p>
                        )}
                        {phaseData?.notes && (
                          <p className="text-xs text-gray-600 mt-1 italic">
                            Notes: {phaseData.notes}
                          </p>
                        )}
                      </div>
                      
                      <Badge className={getStatusColor(phaseStatus)}>
                        {phaseStatus}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Contractor Assignments */}
          {request.contractorAssignments && request.contractorAssignments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Contractor Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {request.contractorAssignments.map((assignment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Vendor ID: {assignment.vendorId}</p>
                        <p className="text-sm text-gray-600">Type: {assignment.assignmentType}</p>
                      </div>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Purchase Orders */}
          {request.purchaseOrders && request.purchaseOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Purchase Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {request.purchaseOrders.map((po, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">PO Number: {po.poNumber}</p>
                        <p className="text-sm text-gray-600">Amount: ${po.totalAmount?.toLocaleString()}</p>
                      </div>
                      <Badge className={getStatusColor(po.status)}>
                        {po.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quality Checks */}
          {request.workQualityChecks && request.workQualityChecks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Quality Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {request.workQualityChecks.map((check, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-600">Quality Rating</p>
                          <p className="text-lg font-bold text-green-600">{check.qualityRating}/5</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Time Performance</p>
                          <p className="text-lg font-bold text-blue-600">{check.timePerformanceRating}/5</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Cost Performance</p>
                          <p className="text-lg font-bold text-purple-600">{check.costPerformanceRating}/5</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge className={check.approvedForClosure ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {check.approvedForClosure ? 'Approved for Closure' : 'Not Approved'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Info Panel */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-sm text-gray-900">{new Date(request.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              {request.dueDate && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Due Date</p>
                    <p className="text-sm text-gray-900">{new Date(request.dueDate).toLocaleString()}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-sm text-gray-900">{request.location}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Wrench className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Work Type</p>
                  <p className="text-sm text-gray-900">{request.workType}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Source</p>
                  <p className="text-sm text-gray-900">{request.originationSource.replace('_', ' ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Assign Contractor
              </Button>
              <Button className="w-full" variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                Create PO
              </Button>
              <Button className="w-full" variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Quality Check
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkflowRequestDetails;
