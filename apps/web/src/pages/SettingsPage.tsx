import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultSLAHours: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  autoAssignWorkOrders: boolean;
  requireApprovalForHighPriority: boolean;
  enablePredictiveMaintenance: boolean;
  enableIoTIntegration: boolean;
  enableBlockchainAudit: boolean;
  enableARMaintenance: boolean;
  enableEnergyManagement: boolean;
  enableVendorManagement: boolean;
  version: string;
  lastUpdated: string;
}

interface SystemHealth {
  status: string;
  database: string;
  workOrders: number;
  activeUsers: number;
  uptime: number;
  timestamp: string;
  version: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'features' | 'health' | 'backup'>('general');

  useEffect(() => {
    fetchSettings();
    fetchHealth();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/v1/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      setSettings(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/v1/settings/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch health status');
      
      const data = await response.json();
      setHealth(data.data);
    } catch (err: any) {
      console.error('Failed to fetch health:', err);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/v1/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) throw new Error('Failed to save settings');
      
      setError(null);
      // Show success message
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load settings</p>
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
              <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600">Configure system-wide settings and preferences</p>
            </div>
            <div className="text-sm text-gray-500">
              Version: <span className="text-blue-600 font-medium">{settings.version}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'general', name: 'General', icon: '⚙️' },
                { id: 'notifications', name: 'Notifications', icon: '🔔' },
                { id: 'features', name: 'Features', icon: '🚀' },
                { id: 'health', name: 'System Health', icon: '💚' },
                { id: 'backup', name: 'Backup', icon: '💾' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">General Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default SLA Hours
                  </label>
                  <input
                    type="number"
                    value={settings.defaultSLAHours}
                    onChange={(e) => handleSettingChange('defaultSLAHours', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.maxFileSize / 1024 / 1024}
                    onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value) * 1024 * 1024)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed File Types
                  </label>
                  <input
                    type="text"
                    value={settings.allowedFileTypes.join(', ')}
                    onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value.split(', '))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="jpg, png, pdf, doc"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Maintenance Mode
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) => handleSettingChange('allowRegistration', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Allow User Registration
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoAssignWorkOrders}
                    onChange={(e) => handleSettingChange('autoAssignWorkOrders', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Auto-assign Work Orders
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.requireApprovalForHighPriority}
                    onChange={(e) => handleSettingChange('requireApprovalForHighPriority', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Require Approval for High Priority Work Orders
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Email Notifications
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    SMS Notifications
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Push Notifications
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Feature Settings */}
          {activeTab === 'features' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Advanced Features</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.enablePredictiveMaintenance}
                      onChange={(e) => handleSettingChange('enablePredictiveMaintenance', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      AI Predictive Maintenance
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.enableIoTIntegration}
                      onChange={(e) => handleSettingChange('enableIoTIntegration', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      IoT Sensor Integration
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.enableBlockchainAudit}
                      onChange={(e) => handleSettingChange('enableBlockchainAudit', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Blockchain Audit Trails
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.enableARMaintenance}
                      onChange={(e) => handleSettingChange('enableARMaintenance', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      AR Maintenance Guidance
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.enableEnergyManagement}
                      onChange={(e) => handleSettingChange('enableEnergyManagement', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Energy Management
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.enableVendorManagement}
                      onChange={(e) => handleSettingChange('enableVendorManagement', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Vendor Management
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Health */}
          {activeTab === 'health' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">System Health</h3>
              
              {health ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        health.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900">System Status</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2 capitalize">{health.status}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        health.database === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900">Database</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2 capitalize">{health.database}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Work Orders</span>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{health.workOrders}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Active Users</span>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{health.activeUsers}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Uptime</span>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{Math.floor(health.uptime / 3600)}h</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Version</span>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{health.version}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading health status...</p>
              )}
            </div>
          )}

          {/* Backup Settings */}
          {activeTab === 'backup' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Backup & Recovery</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Last Backup</h4>
                  <p className="text-sm text-gray-600">2024-01-15 14:30:00 UTC</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Next Backup</h4>
                  <p className="text-sm text-gray-600">2024-01-16 14:30:00 UTC</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Backup Size</h4>
                  <p className="text-sm text-gray-600">2.5 GB</p>
                </div>

                <div className="flex space-x-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Create Manual Backup
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                    Download Backup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
