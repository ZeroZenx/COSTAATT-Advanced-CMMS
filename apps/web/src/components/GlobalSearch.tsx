import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

interface SearchResult {
  id: string;
  type: 'work-order' | 'user' | 'inventory' | 'maintenance' | 'location' | 'category';
  title: string;
  description: string;
  url: string;
  icon: string;
  metadata?: {
    status?: string;
    priority?: string;
    role?: string;
    quantity?: number;
    category?: string;
  };
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Mock search function - in real app, this would call your API
  const searchItems = async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim()) return [];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock data - in real app, this would come from your API
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'work-order',
        title: 'HVAC Repair - Building A',
        description: 'Air conditioning unit not cooling properly in conference room',
        url: '/work-orders',
        icon: '🔧',
        metadata: { status: 'Open', priority: 'High' }
      },
      {
        id: '2',
        type: 'user',
        title: 'John Smith',
        description: 'Senior Technician - Electrical Department',
        url: '/users',
        icon: '👤',
        metadata: { role: 'Technician' }
      },
      {
        id: '3',
        type: 'inventory',
        title: 'Air Filter 20x25x1',
        description: 'HVAC filter for main building units',
        url: '/inventory',
        icon: '📦',
        metadata: { quantity: 20, category: 'HVAC' }
      },
      {
        id: '4',
        type: 'maintenance',
        title: 'Monthly HVAC Check',
        description: 'Scheduled maintenance for all HVAC units',
        url: '/maintenance',
        icon: '📅',
        metadata: { status: 'Scheduled' }
      },
      {
        id: '5',
        type: 'work-order',
        title: 'Light Bulb Replacement',
        description: 'Replace burned out bulbs in hallway',
        url: '/work-orders',
        icon: '🔧',
        metadata: { status: 'Completed', priority: 'Low' }
      }
    ];

    // Filter results based on query
    return mockResults.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  useEffect(() => {
    const handleSearch = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchItems(query);
        setResults(searchResults);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, results, selectedIndex]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'work-order':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'user':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'inventory':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      case 'maintenance':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'work-order':
        return 'Work Order';
      case 'user':
        return 'User';
      case 'inventory':
        return 'Inventory';
      case 'maintenance':
        return 'Maintenance';
      case 'location':
        return 'Location';
      case 'category':
        return 'Category';
      default:
        return 'Item';
    }
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search everything... (Press / to focus)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className={`block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-600 rounded-md leading-5 bg-white dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            isOpen ? 'rounded-b-none' : ''
          }`}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-b-md shadow-lg max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
              {query.length < 2 ? (
                <p>Type at least 2 characters to search</p>
              ) : (
                <div>
                  <svg className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>No results found for "{query}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-1">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-700 ${
                    index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 text-2xl">{result.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {result.title}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {result.description}
                      </p>
                      {result.metadata && (
                        <div className="flex items-center space-x-2 mt-2">
                          {result.metadata.status && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              result.metadata.status === 'Open' ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' :
                              result.metadata.status === 'Completed' ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' :
                              'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
                            }`}>
                              {result.metadata.status}
                            </span>
                          )}
                          {result.metadata.priority && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              result.metadata.priority === 'High' ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20' :
                              result.metadata.priority === 'Medium' ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20' :
                              'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                            }`}>
                              {result.metadata.priority}
                            </span>
                          )}
                          {result.metadata.quantity && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Qty: {result.metadata.quantity}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
