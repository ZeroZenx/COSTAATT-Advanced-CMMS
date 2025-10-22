import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

const API_URL = import.meta.env.VITE_API_URL || 'http://10.2.1.27:4000/api/v1';

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  rating?: number;
  isActive: boolean;
  createdAt: string;
  contracts: Contract[];
  performance: Performance[];
  _count: {
    contracts: number;
    performance: number;
    assignments: number;
  };
}

interface Contract {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  value: number;
  status: 'active' | 'expired' | 'terminated';
  vendor: {
    id: string;
    name: string;
    email: string;
  };
}

interface Performance {
  id: string;
  rating: number;
  responseTime?: number;
  quality?: number;
  cost?: number;
  notes?: string;
  createdAt: string;
  workOrder?: {
    id: string;
    title: string;
    workOrderNumber: string;
  };
  user: {
    id: string;
    displayName: string;
  };
}

const ContractorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateVendor, setShowCreateVendor] = useState(false);
  const [showCreateContract, setShowCreateContract] = useState(false);
  const [showCreatePerformance, setShowCreatePerformance] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Form states
  const [vendorForm, setVendorForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    rating: 0,
    isActive: true,
  });

  const [contractForm, setContractForm] = useState({
    vendorId: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    value: 0,
    status: 'active' as 'active' | 'expired' | 'terminated',
  });

  const [performanceForm, setPerformanceForm] = useState({
    vendorId: '',
    workOrderId: '',
    rating: 5,
    responseTime: 0,
    quality: 5,
    cost: 0,
    notes: '',
  });

  useEffect(() => {
    fetchVendors();
    fetchContracts();
    fetchPerformance();
  }, []);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/contractors/vendors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch vendors');
      
      const data = await response.json();
      setVendors(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vendors');
    }
  };

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/contractors/contracts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch contracts');
      
      const data = await response.json();
      setContracts(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contracts');
    }
  };

  const fetchPerformance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/contractors/performance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch performance');
      
      const data = await response.json();
      setPerformance(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/contractors/vendors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(vendorForm),
      });
      
      if (!response.ok) throw new Error('Failed to create vendor');
      
      await fetchVendors();
      setShowCreateVendor(false);
      setVendorForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        contactPerson: '',
        rating: 0,
        isActive: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vendor');
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/contractors/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(contractForm),
      });
      
      if (!response.ok) throw new Error('Failed to create contract');
      
      await fetchContracts();
      setShowCreateContract(false);
      setContractForm({
        vendorId: '',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        value: 0,
        status: 'active',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contract');
    }
  };

  const handleCreatePerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/contractors/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(performanceForm),
      });
      
      if (!response.ok) throw new Error('Failed to create performance record');
      
      await fetchPerformance();
      setShowCreatePerformance(false);
      setPerformanceForm({
        vendorId: '',
        workOrderId: '',
        rating: 5,
        responseTime: 0,
        quality: 5,
        cost: 0,
        notes: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create performance record');
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vendor.contactPerson && vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && vendor.isActive) ||
                         (statusFilter === 'inactive' && !vendor.isActive);
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading contractors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contractor Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateVendor(true)}>
            Add Vendor
          </Button>
          <Button onClick={() => setShowCreateContract(true)} variant="outline">
            Add Contract
          </Button>
          <Button onClick={() => setShowCreatePerformance(true)} variant="outline">
            Add Performance
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Tabs defaultValue="vendors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vendors">Vendors ({vendors.length})</TabsTrigger>
          <TabsTrigger value="contracts">Contracts ({contracts.length})</TabsTrigger>
          <TabsTrigger value="performance">Performance ({performance.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors" className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{vendor.name}</CardTitle>
                      <p className="text-gray-600">{vendor.email}</p>
                      {vendor.contactPerson && (
                        <p className="text-sm text-gray-500">Contact: {vendor.contactPerson}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={vendor.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {vendor.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {vendor.rating && (
                        <div className={`text-sm font-medium ${getRatingColor(vendor.rating)}`}>
                          ⭐ {vendor.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Contracts:</span> {vendor._count.contracts}
                    </div>
                    <div>
                      <span className="font-medium">Performance Records:</span> {vendor._count.performance}
                    </div>
                    <div>
                      <span className="font-medium">Assignments:</span> {vendor._count.assignments}
                    </div>
                  </div>
                  {vendor.phone && (
                    <p className="text-sm text-gray-600 mt-2">Phone: {vendor.phone}</p>
                  )}
                  {vendor.address && (
                    <p className="text-sm text-gray-600">Address: {vendor.address}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <div className="grid gap-4">
            {contracts.map((contract) => (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{contract.title}</CardTitle>
                      <p className="text-gray-600">{contract.vendor.name}</p>
                      {contract.description && (
                        <p className="text-sm text-gray-500 mt-1">{contract.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status.toUpperCase()}
                      </Badge>
                      <div className="text-sm font-medium">
                        ${contract.value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Start Date:</span> {new Date(contract.startDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">End Date:</span> {new Date(contract.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4">
            {performance.map((perf) => (
              <Card key={perf.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Performance Record</CardTitle>
                      <p className="text-gray-600">Rated by: {perf.user.displayName}</p>
                      {perf.workOrder && (
                        <p className="text-sm text-gray-500">Work Order: {perf.workOrder.workOrderNumber}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className={`text-lg font-bold ${getRatingColor(perf.rating)}`}>
                        ⭐ {perf.rating}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {perf.responseTime && (
                      <div>
                        <span className="font-medium">Response Time:</span> {perf.responseTime} hours
                      </div>
                    )}
                    {perf.quality && (
                      <div>
                        <span className="font-medium">Quality:</span> 
                        <div className="flex items-center gap-2">
                          <Progress value={perf.quality * 20} className="w-20" />
                          <span>{perf.quality}/5</span>
                        </div>
                      </div>
                    )}
                    {perf.cost && (
                      <div>
                        <span className="font-medium">Cost:</span> ${perf.cost.toLocaleString()}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Date:</span> {new Date(perf.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {perf.notes && (
                    <p className="text-sm text-gray-600 mt-2">{perf.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Vendor Modal */}
      {showCreateVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateVendor} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={vendorForm.contactPerson}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={vendorForm.address}
                    onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={vendorForm.rating}
                    onChange={(e) => setVendorForm({ ...vendorForm, rating: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={vendorForm.isActive}
                    onChange={(e) => setVendorForm({ ...vendorForm, isActive: e.target.checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Vendor</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateVendor(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Contract Modal */}
      {showCreateContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Contract</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateContract} className="space-y-4">
                <div>
                  <Label htmlFor="vendorId">Vendor *</Label>
                  <Select value={contractForm.vendorId} onValueChange={(value) => setContractForm({ ...contractForm, vendorId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={contractForm.title}
                    onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={contractForm.description}
                    onChange={(e) => setContractForm({ ...contractForm, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={contractForm.startDate}
                      onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={contractForm.endDate}
                      onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="value">Value ($) *</Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={contractForm.value}
                    onChange={(e) => setContractForm({ ...contractForm, value: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={contractForm.status} onValueChange={(value: 'active' | 'expired' | 'terminated') => setContractForm({ ...contractForm, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Contract</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateContract(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Performance Modal */}
      {showCreatePerformance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Performance Record</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePerformance} className="space-y-4">
                <div>
                  <Label htmlFor="vendorId">Vendor *</Label>
                  <Select value={performanceForm.vendorId} onValueChange={(value) => setPerformanceForm({ ...performanceForm, vendorId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rating">Rating (1-5) *</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={performanceForm.rating}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, rating: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="responseTime">Response Time (hours)</Label>
                  <Input
                    id="responseTime"
                    type="number"
                    min="0"
                    value={performanceForm.responseTime}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, responseTime: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="quality">Quality (1-5)</Label>
                  <Input
                    id="quality"
                    type="number"
                    min="1"
                    max="5"
                    value={performanceForm.quality}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, quality: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={performanceForm.cost}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, cost: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={performanceForm.notes}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, notes: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Performance Record</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreatePerformance(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ContractorsPage;
