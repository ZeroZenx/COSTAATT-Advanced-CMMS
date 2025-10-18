import React, { useState } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { useTheme } from '../../contexts/ThemeContext';
import StatsWidget from './StatsWidget';
import ChartWidget from './ChartWidget';
import TableWidget from './TableWidget';
import ActivityWidget from './ActivityWidget';

export default function CustomizableDashboard() {
  const { 
    currentLayout, 
    layouts, 
    isEditMode, 
    setEditMode, 
    removeWidget, 
    saveLayout, 
    loadLayout, 
    resetLayout 
  } = useDashboard();
  const { isDark } = useTheme();
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showLayouts, setShowLayouts] = useState(false);

  const renderWidget = (widget: any) => {
    const commonProps = {
      widget,
      isEditMode,
      onRemove: () => removeWidget(widget.id)
    };

    switch (widget.type) {
      case 'stats':
        return <StatsWidget key={widget.id} {...commonProps} />;
      case 'chart':
        return <ChartWidget key={widget.id} {...commonProps} />;
      case 'table':
        return <TableWidget key={widget.id} {...commonProps} />;
      case 'recent-activity':
        return <ActivityWidget key={widget.id} {...commonProps} />;
      default:
        return null;
    }
  };

  const getGridCols = () => {
    const maxCols = Math.max(...currentLayout.widgets.map(w => w.position.x + (w.size === 'small' ? 1 : w.size === 'medium' ? 2 : 3)));
    return `grid-cols-${Math.min(maxCols + 1, 6)}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customizable Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Personalize your workspace</p>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Layout Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLayouts(!showLayouts)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>Layouts</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showLayouts && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-md shadow-lg border border-gray-200 dark:border-dark-700 z-10">
                    <div className="py-1">
                      {layouts.map((layout) => (
                        <button
                          key={layout.id}
                          onClick={() => {
                            loadLayout(layout.id);
                            setShowLayouts(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700"
                        >
                          {layout.name}
                          {layout.isDefault && (
                            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(Default)</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add Widget */}
              <button
                onClick={() => setShowAddWidget(!showAddWidget)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Widget</span>
              </button>

              {/* Edit Mode Toggle */}
              <button
                onClick={() => setEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isEditMode
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-600'
                }`}
              >
                {isEditMode ? 'Exit Edit' : 'Edit Layout'}
              </button>

              {/* Save Layout */}
              {isEditMode && (
                <button
                  onClick={() => {
                    const name = prompt('Enter layout name:');
                    if (name) saveLayout(name);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Save Layout
                </button>
              )}

              {/* Reset Layout */}
              <button
                onClick={resetLayout}
                className="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-dark-600"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Add Widget Panel */}
      {showAddWidget && (
        <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 p-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Widget</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'stats', title: 'Statistics', icon: '📊' },
                { type: 'chart', title: 'Chart', icon: '📈' },
                { type: 'table', title: 'Data Table', icon: '📋' },
                { type: 'recent-activity', title: 'Activity Feed', icon: '🔄' }
              ].map((widget) => (
                <button
                  key={widget.type}
                  onClick={() => {
                    // Add widget logic would go here
                    setShowAddWidget(false);
                  }}
                  className="p-4 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 text-center"
                >
                  <div className="text-2xl mb-2">{widget.icon}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{widget.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentLayout.widgets.length === 0 ? (
          <div className="text-center py-12">
            <svg className="h-24 w-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No widgets yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Add some widgets to get started</p>
            <button
              onClick={() => setShowAddWidget(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Add Your First Widget
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
            {currentLayout.widgets.map(renderWidget)}
          </div>
        )}
      </main>
    </div>
  );
}
