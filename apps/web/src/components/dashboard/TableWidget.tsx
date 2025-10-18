import React from 'react';
import { DashboardWidget } from '../../contexts/DashboardContext';
import { useTheme } from '../../contexts/ThemeContext';

interface TableWidgetProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  onRemove: () => void;
}

export default function TableWidget({ widget, isEditMode, onRemove }: TableWidgetProps) {
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'in progress':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'high':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
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

        {/* Table Content */}
        {data?.columns && data?.rows ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  {data.columns.map((column: string, index: number) => (
                    <th
                      key={index}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                {data.rows.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    {row.map((cell: string, cellIndex: number) => (
                      <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-sm">
                        {data.columns[cellIndex]?.toLowerCase().includes('status') || 
                         data.columns[cellIndex]?.toLowerCase().includes('priority') ? (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cell)}`}>
                            {cell}
                          </span>
                        ) : (
                          <span className="text-gray-900 dark:text-white">{cell}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            <p>No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
