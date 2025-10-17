import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  description?: string;
  isLowStock: boolean;
}

export default function InventoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          name: 'Air Filter 16x20',
          sku: 'AF-1620-001',
          category: 'HVAC',
          quantity: 5,
          reorderLevel: 10,
          unitCost: 25.99,
          description: 'Standard air filter for main building units',
          isLowStock: true
        },
        {
          id: '2',
          name: 'Light Bulb LED 60W',
          sku: 'LB-LED-60W',
          category: 'Electrical',
          quantity: 0,
          reorderLevel: 20,
          unitCost: 8.50,
          description: 'Energy efficient LED light bulbs',
          isLowStock: true
        },
        {
          id: '3',
          name: 'Pipe Wrench 12 inch',
          sku: 'PW-12-001',
          category: 'Plumbing',
          quantity: 15,
          reorderLevel: 5,
          unitCost: 45.00,
          description: 'Heavy duty pipe wrench',
          isLowStock: false
        },
        {
          id: '4',
          name: 'Electrical Tape',
          sku: 'ET-BLK-001',
          category: 'Electrical',
          quantity: 8,
          reorderLevel: 10,
          unitCost: 3.25,
          description: 'Black electrical tape roll',
          isLowStock: true
        },
        {
          id: '5',
          name: 'Generator Oil 5W-30',
          sku: 'GO-5W30-001',
          category: 'Mechanical',
          quantity: 25,
          reorderLevel: 5,
          unitCost: 12.99,
          description: 'High quality generator oil',
          isLowStock: false
        }
      ];
      setItems(mockItems);
    } catch (err) {
      setError('Failed to fetch inventory items');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatusColor = (item: InventoryItem) => {
    if (item.quantity === 0) return 'bg-red-100 text-red-800';
    if (item.isLowStock) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatusText = (item: InventoryItem) => {
    if (item.quantity === 0) return 'OUT OF STOCK';
    if (item.isLowStock) return 'LOW STOCK';
    return 'IN STOCK';
  };

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'low_stock') return item.isLowStock;
    if (filter === 'out_of_stock') return item.quantity === 0;
    return true;
  });

  const lowStockCount = items.filter(item => item.isLowStock).length;
  const outOfStockCount = items.filter(item => item.quantity === 0).length;
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="mt-2 text-gray-600">Track tools, parts, and consumables</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Item
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📦</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                      <dd className="text-lg font-medium text-gray-900">{items.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">⚠️</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Low Stock</dt>
                      <dd className="text-lg font-medium text-gray-900">{lowStockCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">❌</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Out of Stock</dt>
                      <dd className="text-lg font-medium text-gray-900">{outOfStockCount}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">💰</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
                      <dd className="text-lg font-medium text-gray-900">${totalValue.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex space-x-4">
              {['all', 'low_stock', 'out_of_stock'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType as any)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === filterType
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {filterType.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Inventory Items ({filteredItems.length})
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <li key={item.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-lg font-medium text-gray-900">
                              {item.name}
                            </h4>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(item)}`}>
                              {getStockStatusText(item)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span className="mr-4">🏷️ SKU: {item.sku}</span>
                            <span className="mr-4">📂 Category: {item.category}</span>
                            <span className="mr-4">📦 Quantity: {item.quantity}</span>
                            <span className="mr-4">⚠️ Reorder Level: {item.reorderLevel}</span>
                            <span className="mr-4">💰 Unit Cost: ${item.unitCost.toFixed(2)}</span>
                            <span className="mr-4">💵 Total Value: ${(item.quantity * item.unitCost).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                            Adjust
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
