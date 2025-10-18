import React from 'react';
import { DashboardWidget } from '../../contexts/DashboardContext';
import { useTheme } from '../../contexts/ThemeContext';

interface ChartWidgetProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  onRemove: () => void;
}

export default function ChartWidget({ widget, isEditMode, onRemove }: ChartWidgetProps) {
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

  const renderPieChart = () => {
    if (!data?.data) return null;

    const total = data.data.reduce((sum: number, item: any) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {data.data.map((item: any, index: number) => {
            const percentage = (item.value / total) * 100;
            const startAngle = cumulativePercentage * 3.6;
            const endAngle = (cumulativePercentage + percentage) * 3.6;
            cumulativePercentage += percentage;

            const radius = 40;
            const centerX = 50;
            const centerY = 50;
            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);

            const largeArcFlag = percentage > 50 ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                className="hover:opacity-80 transition-opacity"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const renderBarChart = () => {
    if (!data?.data) return null;

    const maxValue = Math.max(...data.data.map((item: any) => item.value));
    
    return (
      <div className="flex items-end justify-between h-32 space-x-2">
        {data.data.map((item: any, index: number) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full rounded-t"
              style={{
                height: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color,
                minHeight: '4px'
              }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    );
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

        {/* Chart Content */}
        <div className="flex items-center justify-center">
          {data?.type === 'pie' ? renderPieChart() : renderBarChart()}
        </div>

        {/* Legend */}
        {data?.data && (
          <div className="mt-4 space-y-2">
            {data.data.map((item: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
