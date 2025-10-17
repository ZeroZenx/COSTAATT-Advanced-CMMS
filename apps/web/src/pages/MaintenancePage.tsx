import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface MaintenanceSchedule {
  id: string;
  title: string;
  description: string;
  assetId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextDueDate: string;
  lastCompletedDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  assignedTo?: {
    id: string;
    displayName: string;
  };
}

export default function MaintenancePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'overdue'>('all');

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockSchedules: MaintenanceSchedule[] = [
        {
          id: '1',
          title: 'Monthly AC Filter Replacement',
          description: 'Replace air conditioning filters in all units',
          assetId: 'AC-001',
          frequency: 'MONTHLY',
          nextDueDate: '2025-11-13T09:00:00Z',
          lastCompletedDate: '2025-10-13T09:00:00Z',
          status: 'ACTIVE',
          assignedTo: { id: '2', displayName: 'John Doe' }
        },
        {
          id: '2',
          title: 'Weekly Generator Check',
          description: 'Test backup generator and check fuel levels',
          assetId: 'GEN-001',
          frequency: 'WEEKLY',
          nextDueDate: '2025-10-20T08:00:00Z',
          lastCompletedDate: '2025-10-13T08:00:00Z',
          status: 'ACTIVE',
          assignedTo: { id: '3', displayName: 'Mike Johnson' }
        },
        {
          id: '3',
          title: 'Annual Fire Safety Inspection',
          description: 'Complete fire safety system inspection',
          assetId: 'FIRE-001',
          frequency: 'YEARLY',
          nextDueDate: '2025-12-01T10:00:00Z',
          lastCompletedDate: '2024-12-01T10:00:00Z',
          status: 'ACTIVE',
          assignedTo: { id: '2', displayName: 'John Doe' }
        }
      ];
      setSchedules(mockSchedules);
    } catch (err) {
      setError('Failed to fetch maintenance schedules');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'DAILY': return 'bg-red-100 text-red-800';
      case 'WEEKLY': return 'bg-orange-100 text-orange-800';
      case 'MONTHLY': return 'bg-yellow-100 text-yellow-800';
      case 'YEARLY': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (nextDueDate: string) => {
    return new Date(nextDueDate) < new Date();
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return isOverdue(schedule.nextDueDate);
    return schedule.status.toLowerCase() === filter.toUpperCase();
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading maintenance schedules...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Preventive Maintenance</h1>
              <p className="mt-2 text-gray-600">Manage scheduled maintenance tasks and assets</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create Schedule
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex space-x-4">
              {['all', 'active', 'inactive', 'overdue'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === filterType
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Schedules Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Maintenance Schedules ({filteredSchedules.length})
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {filteredSchedules.map((schedule) => (
                  <li key={schedule.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-lg font-medium text-gray-900">
                              {schedule.title}
                            </h4>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                              {schedule.status}
                            </span>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFrequencyColor(schedule.frequency)}`}>
                              {schedule.frequency}
                            </span>
                            {isOverdue(schedule.nextDueDate) && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{schedule.description}</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="mr-4">🏷️ Asset: {schedule.assetId}</span>
                            <span className="mr-4">📅 Next Due: {new Date(schedule.nextDueDate).toLocaleDateString()}</span>
                            {schedule.lastCompletedDate && (
                              <span className="mr-4">✅ Last Completed: {new Date(schedule.lastCompletedDate).toLocaleDateString()}</span>
                            )}
                            {schedule.assignedTo && (
                              <span className="mr-4">👤 Assigned to {schedule.assignedTo.displayName}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                            Run Now
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
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
