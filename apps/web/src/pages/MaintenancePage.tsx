import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

interface MaintenanceSchedule {
  id: string;
  title: string;
  description?: string;
  assetId: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextDueDate: string;
  isActive: boolean;
  createdAt: string;
  assignedTo?: {
    id: string;
    displayName: string;
    email: string;
  };
  tasks?: any[];
}

interface ScheduleFormData {
  title: string;
  description: string;
  assetId: string;
  frequency: string;
  nextDueDate: string;
  assignedToId: string;
}

export default function MaintenancePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MaintenanceSchedule | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: '',
    description: '',
    assetId: '',
    frequency: 'MONTHLY',
    nextDueDate: '',
    assignedToId: '',
  });

  useEffect(() => {
    fetchSchedules();
    fetchUsers();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/maintenance/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSchedules(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch maintenance schedules');
      console.error('Fetch schedules error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.data);
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/maintenance/schedules`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setShowCreateModal(false);
      setSuccess('Maintenance schedule created successfully!');
      resetForm();
      fetchSchedules();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create maintenance schedule');
    }
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/maintenance/schedules/${selectedSchedule.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setShowEditModal(false);
      setSuccess('Maintenance schedule updated successfully!');
      resetForm();
      fetchSchedules();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update maintenance schedule');
    }
  };

  const handleRunSchedule = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/maintenance/schedules/${id}/run`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSuccess('Maintenance task created successfully!');
      fetchSchedules();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to run maintenance schedule');
    }
  };

  const openEditModal = (schedule: MaintenanceSchedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      title: schedule.title,
      description: schedule.description || '',
      assetId: schedule.assetId,
      frequency: schedule.frequency,
      nextDueDate: new Date(schedule.nextDueDate).toISOString().slice(0, 16),
      assignedToId: schedule.assignedTo?.id || '',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assetId: '',
      frequency: 'MONTHLY',
      nextDueDate: '',
      assignedToId: '',
    });
    setSelectedSchedule(null);
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'DAILY': return 'bg-red-100 text-red-800';
      case 'WEEKLY': return 'bg-orange-100 text-orange-800';
      case 'MONTHLY': return 'bg-blue-100 text-blue-800';
      case 'YEARLY': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (nextDueDate: string) => {
    return new Date(nextDueDate) < new Date();
  };

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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Preventive Maintenance</h1>
              <p className="mt-2 text-gray-600">Manage scheduled maintenance tasks and assets</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center"
            >
              <span className="mr-2">➕</span>
              New Schedule
            </button>
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center justify-between">
              <span>✅ {success}</span>
              <button onClick={() => setSuccess(null)} className="text-green-800">✕</button>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-800">✕</button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-6">
            {[
              { label: 'Total Schedules', count: schedules.length, color: 'bg-blue-500', icon: '📅' },
              { label: 'Active', count: schedules.filter(s => s.isActive).length, color: 'bg-green-500', icon: '✅' },
              { label: 'Overdue', count: schedules.filter(s => isOverdue(s.nextDueDate)).length, color: 'bg-red-500', icon: '⚠️' },
              { label: 'This Week', count: schedules.filter(s => {
                const due = new Date(s.nextDueDate);
                const weekFromNow = new Date();
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                return due <= weekFromNow;
              }).length, color: 'bg-orange-500', icon: '📆' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                      <div className="text-white text-2xl">{stat.icon}</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                        <dd className="text-lg font-semibold text-gray-900">{stat.count}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {schedules.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔧</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance schedules</h3>
                <p className="text-gray-500">Create your first preventive maintenance schedule</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <li key={schedule.id} className="hover:bg-gray-50 transition-colors">
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{schedule.title}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFrequencyColor(schedule.frequency)}`}>
                              {schedule.frequency}
                            </span>
                            {isOverdue(schedule.nextDueDate) && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                ⚠️ OVERDUE
                              </span>
                            )}
                          </div>
                          {schedule.description && (
                            <p className="text-sm text-gray-600 mb-2">{schedule.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>🏭 Asset: {schedule.assetId}</span>
                            <span>📅 Next Due: {new Date(schedule.nextDueDate).toLocaleDateString()}</span>
                            {schedule.assignedTo && (
                              <span>👤 {schedule.assignedTo.displayName}</span>
                            )}
                            {schedule.tasks && schedule.tasks.length > 0 && (
                              <span>📝 {schedule.tasks.length} tasks completed</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex space-x-2">
                          <button
                            onClick={() => handleRunSchedule(schedule.id)}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                          >
                            Run Now
                          </button>
                          <button
                            onClick={() => openEditModal(schedule)}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={showCreateModal ? handleCreateSchedule : handleUpdateSchedule}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {showCreateModal ? 'Create Maintenance Schedule' : 'Edit Maintenance Schedule'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., HVAC Filter Replacement"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Asset/Location *</label>
                      <input
                        type="text"
                        required
                        value={formData.assetId}
                        onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Main Building - HVAC Unit 1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Frequency *</label>
                        <select
                          required
                          value={formData.frequency}
                          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="DAILY">Daily</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="MONTHLY">Monthly</option>
                          <option value="YEARLY">Yearly</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Next Due Date *</label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.nextDueDate}
                          onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assign To</label>
                      <select
                        value={formData.assignedToId}
                        onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Unassigned</option>
                        {users.filter(u => u.role === 'TECHNICIAN' || u.role === 'SUPERVISOR').map(u => (
                          <option key={u.id} value={u.id}>{u.displayName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {showCreateModal ? 'Create Schedule' : 'Update Schedule'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); setShowEditModal(false); resetForm(); }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
