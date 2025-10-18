import React from 'react';
import { DashboardWidget } from '../../contexts/DashboardContext';
import { useTheme } from '../../contexts/ThemeContext';

interface ActivityWidgetProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  onRemove: () => void;
}

export default function ActivityWidget({ widget, isEditMode, onRemove }: ActivityWidgetProps) {
  const { isDark } = useTheme();
  const { data } = widget;

  const getSizeClasses = () => {
    switch (widget.size) {
      case 'small':
        return 'col-span-1';
      case 'medium':
        return 'col-span-2';
      case 'large':
        return 'col-span-3';
      default:
        return 'col-span-2';
    }
  };

  const getActivityIcon = (action: string) => {
    if (action.toLowerCase().includes('work order')) {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    } else if (action.toLowerCase().includes('inventory')) {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
          <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      );
    } else if (action.toLowerCase().includes('maintenance')) {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
          <svg className="h-4 w-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    }
  };

  return (
    <div className={`${getSizeClasses()} relative`}>
      <div className={`bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6 ${
        isEditMode ? 'ring-2 ring-blue-500' : ''
      }`}>
        {/* Edit Mode Controls */}
        {isEditMode && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <button
              onClick={onRemove}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              title="Remove widget"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Widget Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{widget.title}</h3>
        </div>

        {/* Activity List */}
        {data?.activities && data.activities.length > 0 ? (
          <div className="space-y-4">
            {data.activities.map((activity: any) => (
              <div key={activity.id} className="flex items-start space-x-3">
                {getActivityIcon(activity.action)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    by {activity.user}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
