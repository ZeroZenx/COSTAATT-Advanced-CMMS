import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  location: string;
  category: string;
  createdAt: string;
  dueDate?: string;
  assignedTo?: {
    id: string;
    displayName: string;
  };
  createdBy: {
    id: string;
    displayName: string;
  };
}

export default function WorkOrdersPage() {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since we haven't implemented the full API yet
      const mockWorkOrders: WorkOrder[] = [
        {
          id: '1',
          title: 'Fix Air Conditioning Unit',
          description: 'AC unit in Room 101 is not cooling properly',
          status: 'OPEN',
          priority: 'HIGH',
          location: 'Main Building - Room 101',
          category: 'HVAC',
          createdAt: '2025-10-13T10:00:00Z',
          dueDate: '2025-10-15T17:00:00Z',
          createdBy: { id: '1', displayName: 'Jane Smith' },
          assignedTo: { id: '2', displayName: 'John Doe' }
        },
        {
          id: '2',
          title: 'Replace Light Bulbs',
          description: 'Several light bulbs need replacement in the hallway',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          location: 'Main Building - Hallway',
          category: 'Electrical',
          createdAt: '2025-10-12T14:30:00Z',
          dueDate: '2025-10-14T12:00:00Z',
          createdBy: { id: '1', displayName: 'Jane Smith' },
          assignedTo: { id: '3', displayName: 'Mike Johnson' }
        },
        {
          id: '3',
          title: 'Plumbing Repair',
          description: 'Leaky faucet in the restroom',
          status: 'COMPLETED',
          priority: 'LOW',
          location: 'Main Building - Restroom',
          category: 'Plumbing',
          createdAt: '2025-10-11T09:15:00Z',
          dueDate: '2025-10-13T16:00:00Z',
          createdBy: { id: '1', displayName: 'Jane Smith' },
          assignedTo: { id: '2', displayName: 'John Doe' }
        }
      ];
      setWorkOrders(mockWorkOrders);
    } catch (err) {
      setError('Failed to fetch work orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
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

  const filteredWorkOrders = workOrders.filter(wo => {
    if (filter === 'all') return true;
    return wo.status.toLowerCase() === filter.toUpperCase();
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading work orders...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
              <p className="mt-2 text-gray-600">Manage and track maintenance requests</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Work Order
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex space-x-4">
              {['all', 'open', 'in_progress', 'completed'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === filterType
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Work Orders Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Work Orders ({filteredWorkOrders.length})
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {filteredWorkOrders.map((workOrder) => (
                  <li key={workOrder.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-lg font-medium text-gray-900">
                              {workOrder.title}
                            </h4>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workOrder.status)}`}>
                              {workOrder.status.replace('_', ' ')}
                            </span>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(workOrder.priority)}`}>
                              {workOrder.priority}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{workOrder.description}</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="mr-4">📍 {workOrder.location}</span>
                            <span className="mr-4">🏷️ {workOrder.category}</span>
                            <span className="mr-4">👤 Created by {workOrder.createdBy.displayName}</span>
                            {workOrder.assignedTo && (
                              <span className="mr-4">🔧 Assigned to {workOrder.assignedTo.displayName}</span>
                            )}
                            {workOrder.dueDate && (
                              <span>📅 Due {new Date(workOrder.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
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
