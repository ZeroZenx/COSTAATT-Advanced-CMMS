import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DashboardWidget {
  id: string;
  type: 'stats' | 'chart' | 'table' | 'list' | 'calendar' | 'recent-activity';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  data?: any;
  config?: any;
}

interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault?: boolean;
}

interface DashboardContextType {
  currentLayout: DashboardLayout;
  layouts: DashboardLayout[];
  isEditMode: boolean;
  setEditMode: (edit: boolean) => void;
  addWidget: (widget: Omit<DashboardWidget, 'id' | 'position'>) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  moveWidget: (widgetId: string, position: { x: number; y: number }) => void;
  saveLayout: (name: string) => void;
  loadLayout: (layoutId: string) => void;
  resetLayout: () => void;
}

const defaultWidgets: DashboardWidget[] = [
  {
    id: 'stats-1',
    type: 'stats',
    title: 'Total Work Orders',
    size: 'small',
    position: { x: 0, y: 0 },
    data: { value: 24, change: '+12%', trend: 'up' }
  },
  {
    id: 'stats-2',
    type: 'stats',
    title: 'Open Work Orders',
    size: 'small',
    position: { x: 1, y: 0 },
    data: { value: 8, change: '-3%', trend: 'down' }
  },
  {
    id: 'stats-3',
    type: 'stats',
    title: 'Completed Today',
    size: 'small',
    position: { x: 2, y: 0 },
    data: { value: 5, change: '+25%', trend: 'up' }
  },
  {
    id: 'chart-1',
    type: 'chart',
    title: 'Work Orders by Status',
    size: 'medium',
    position: { x: 0, y: 1 },
    data: { type: 'pie', data: [
      { name: 'Open', value: 8, color: '#ef4444' },
      { name: 'In Progress', value: 12, color: '#f59e0b' },
      { name: 'Completed', value: 4, color: '#10b981' }
    ]}
  },
  {
    id: 'table-1',
    type: 'table',
    title: 'Recent Work Orders',
    size: 'large',
    position: { x: 1, y: 1 },
    data: { columns: ['ID', 'Title', 'Status', 'Priority'], rows: [
      ['WO-001', 'HVAC Repair', 'Open', 'High'],
      ['WO-002', 'Light Bulb Replacement', 'In Progress', 'Low'],
      ['WO-003', 'Door Repair', 'Completed', 'Medium']
    ]}
  },
  {
    id: 'activity-1',
    type: 'recent-activity',
    title: 'Recent Activity',
    size: 'medium',
    position: { x: 0, y: 2 },
    data: { activities: [
      { id: 1, action: 'Work Order Created', user: 'John Smith', time: '2 hours ago' },
      { id: 2, action: 'Inventory Updated', user: 'Jane Doe', time: '4 hours ago' },
      { id: 3, action: 'Maintenance Scheduled', user: 'Bob Wilson', time: '6 hours ago' }
    ]}
  }
];

const defaultLayout: DashboardLayout = {
  id: 'default',
  name: 'Default Layout',
  widgets: defaultWidgets,
  isDefault: true
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout>(defaultLayout);
  const [layouts, setLayouts] = useState<DashboardLayout[]>([defaultLayout]);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load layouts from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-layouts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLayouts(parsed);
          setCurrentLayout(parsed[0] || defaultLayout);
        } catch (error) {
          console.error('Failed to load dashboard layouts:', error);
        }
      }
    }
  }, []);

  // Save layouts to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
    }
  }, [layouts]);

  const addWidget = (widget: Omit<DashboardWidget, 'id' | 'position'>) => {
    const newWidget: DashboardWidget = {
      ...widget,
      id: Math.random().toString(36).substr(2, 9),
      position: { x: 0, y: 0 }
    };

    setCurrentLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));
  };

  const removeWidget = (widgetId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }));
  };

  const updateWidget = (widgetId: string, updates: Partial<DashboardWidget>) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, ...updates } : w
      )
    }));
  };

  const moveWidget = (widgetId: string, position: { x: number; y: number }) => {
    setCurrentLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, position } : w
      )
    }));
  };

  const saveLayout = (name: string) => {
    const newLayout: DashboardLayout = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      widgets: currentLayout.widgets
    };

    setLayouts(prev => [...prev, newLayout]);
    setCurrentLayout(newLayout);
  };

  const loadLayout = (layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId);
    if (layout) {
      setCurrentLayout(layout);
    }
  };

  const resetLayout = () => {
    setCurrentLayout(defaultLayout);
  };

  return (
    <DashboardContext.Provider
      value={{
        currentLayout,
        layouts,
        isEditMode,
        setEditMode: setIsEditMode,
        addWidget,
        removeWidget,
        updateWidget,
        moveWidget,
        saveLayout,
        loadLayout,
        resetLayout,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
