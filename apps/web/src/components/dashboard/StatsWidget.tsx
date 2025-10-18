import React from 'react';
import { DashboardWidget } from '../../contexts/DashboardContext';
import { useTheme } from '../../contexts/ThemeContext';

interface StatsWidgetProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  onRemove: () => void;
}

export default function StatsWidget({ widget, isEditMode, onRemove }: StatsWidgetProps) {
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
        return 'col-span-1';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return (
        <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      );
    } else if (trend === 'down') {
      return (
        <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      );
    }
    return null;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-600 dark:text-green-400';
    if (trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
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

        {/* Widget Content */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{widget.title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {data?.value || 0}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {data?.change && (
              <div className={`flex items-center space-x-1 ${getTrendColor(data.trend)}`}>
                {getTrendIcon(data.trend)}
                <span className="text-sm font-medium">{data.change}</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        {data?.subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{data.subtitle}</p>
        )}
      </div>
    </div>
  );
}
