import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface MyWorkOrder {
  id: string;
  workOrderNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  location: string;
  dueDate: string;
  assignedTo?: {
    displayName: string;
    email: string;
  };
  createdAt: string;
}

interface WorkOrderStats {
  requested: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export default function RequestorDashboard() {
  const { user } = useAuth();
  const [myWorkOrders, setMyWorkOrders] = useState<MyWorkOrder[]>([]);
  const [workOrderStats, setWorkOrderStats] = useState<WorkOrderStats>({
    requested: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyWorkOrders();
  }, []);

  const fetchMyWorkOrders = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/v1/work-orders?createdBy=' + user?.id, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyWorkOrders(data.data);
        
        // Calculate stats
        const stats = {
          requested: data.data.filter((wo: MyWorkOrder) => wo.status === 'OPEN').length,
          inProgress: data.data.filter((wo: MyWorkOrder) => wo.status === 'IN_PROGRESS').length,
          completed: data.data.filter((wo: MyWorkOrder) => wo.status === 'COMPLETED').length,
          cancelled: data.data.filter((wo: MyWorkOrder) => wo.status === 'CANCELLED').length,
        };
        setWorkOrderStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch work orders:', error);
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'ON_HOLD': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return '📋';
      case 'IN_PROGRESS': return '🔧';
      case 'COMPLETED': return '✅';
      case 'ON_HOLD': return '⏸️';
      case 'CANCELLED': return '❌';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Requestor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.displayName}</p>
              <p className="text-sm text-gray-500">Department: {user?.department}</p>
            </div>
            <div className="text-sm text-gray-500">
              Role: <span className="text-purple-600 font-medium">{user?.role}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold">📋</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Requested</dt>
                      <dd className="text-lg font-medium text-gray-900">{workOrderStats.requested}</dd>
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
                      <span className="text-white font-bold">🔧</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                      <dd className="text-lg font-medium text-gray-900">{workOrderStats.inProgress}</dd>
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
                      <span className="text-white font-bold">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                      <dd className="text-lg font-medium text-gray-900">{workOrderStats.completed}</dd>
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
                      <span className="text-white font-bold">❌</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Cancelled</dt>
                      <dd className="text-lg font-medium text-gray-900">{workOrderStats.cancelled}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/work-orders/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center">
                Request New Work Order
              </Link>
              <Link to="/work-orders" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-center">
                View My Requests
              </Link>
              <Link to="/reports" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-center">
                View Reports
              </Link>
            </div>
          </div>

          {/* My Work Order Requests */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">My Work Order Requests</h3>
              <Link to="/work-orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All →
              </Link>
            </div>
            
            {myWorkOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-gray-500 mb-4">No work orders requested yet</p>
                <Link 
                  to="/work-orders/new" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Request Your First Work Order
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myWorkOrders.slice(0, 5).map((workOrder) => (
                  <div key={workOrder.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg">{getStatusIcon(workOrder.status)}</span>
                          <h4 className="text-sm font-medium text-gray-900">{workOrder.workOrderNumber}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(workOrder.priority)}`}>
                            {workOrder.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workOrder.status)}`}>
                            {workOrder.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium">{workOrder.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{workOrder.location} • {workOrder.category}</p>
                        <p className="text-xs text-gray-500">
                          Requested: {new Date(workOrder.createdAt).toLocaleDateString()}
                          {workOrder.dueDate && ` • Due: ${new Date(workOrder.dueDate).toLocaleDateString()}`}
                        </p>
                        {workOrder.assignedTo && (
                          <p className="text-xs text-gray-500 mt-1">
                            Assigned to: {workOrder.assignedTo.displayName}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/work-orders/${workOrder.id}`}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          View Details
                        </Link>
                        {workOrder.status === 'OPEN' && (
                          <button className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* How to Request Work Orders */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">How to Request Work Orders</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📝</span>
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">1. Fill Out Form</h4>
                <p className="text-xs text-gray-500">Provide details about the issue, location, and priority level</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⏳</span>
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">2. Wait for Assignment</h4>
                <p className="text-xs text-gray-500">A supervisor will assign your request to a technician</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✅</span>
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">3. Track Progress</h4>
                <p className="text-xs text-gray-500">Monitor the status and receive updates on your request</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Work order #WO-001 completed</p>
                    <p className="text-xs text-gray-500">HVAC Repair - Room 101 • 2 hours ago</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Completed
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Work order #WO-002 assigned to technician</p>
                    <p className="text-xs text-gray-500">Light Fixture Replacement • 4 hours ago</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Assigned
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New work order request submitted</p>
                    <p className="text-xs text-gray-500">Plumbing Issue - Lab 2 • 6 hours ago</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Submitted
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}