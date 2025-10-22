import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Save, Send } from 'lucide-react';
import { format } from 'date-fns';

interface WorkflowRequestFormProps {
  onSave: (data: WorkflowRequestData) => void;
  onCancel: () => void;
  initialData?: Partial<WorkflowRequestData>;
}

interface WorkflowRequestData {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
  location: string;
  workType: 'INTERNAL' | 'CONTRACTOR' | 'MIXED';
  originationSource: 'CUSTOMER_REQUEST' | 'INSPECTION_ROUNDS' | 'PREVENTIVE_MAINTENANCE' | 'EMERGENCY';
  canPerformInternally: boolean;
  requiresContractor: boolean;
  estimatedCost?: number;
  estimatedDuration?: number;
  dueDate?: Date;
}

const WorkflowRequestForm: React.FC<WorkflowRequestFormProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = useState<WorkflowRequestData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'MEDIUM',
    category: initialData?.category || '',
    location: initialData?.location || '',
    workType: initialData?.workType || 'INTERNAL',
    originationSource: initialData?.originationSource || 'CUSTOMER_REQUEST',
    canPerformInternally: initialData?.canPerformInternally ?? true,
    requiresContractor: initialData?.requiresContractor ?? false,
    estimatedCost: initialData?.estimatedCost,
    estimatedDuration: initialData?.estimatedDuration,
    dueDate: initialData?.dueDate,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Electrical',
    'Plumbing',
    'HVAC',
    'Carpentry',
    'Painting',
    'Cleaning',
    'Security',
    'IT Support',
    'Landscaping',
    'General Maintenance',
    'Emergency Repair',
    'Preventive Maintenance',
  ];

  const locations = [
    'Main Campus - Building A',
    'Main Campus - Building B',
    'Main Campus - Building C',
    'Main Campus - Library',
    'Main Campus - Gymnasium',
    'Main Campus - Cafeteria',
    'Main Campus - Parking Lot',
    'North Campus - Building 1',
    'North Campus - Building 2',
    'South Campus - Building 1',
    'South Campus - Building 2',
    'Remote Location',
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    if (formData.estimatedCost !== undefined && formData.estimatedCost < 0) {
      newErrors.estimatedCost = 'Estimated cost cannot be negative';
    }

    if (formData.estimatedDuration !== undefined && formData.estimatedDuration < 0) {
      newErrors.estimatedDuration = 'Estimated duration cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (saveAsDraft: boolean = false) => {
    if (!validateForm()) {
      return;
    }

    onSave({
      ...formData,
      // Add any additional processing for draft vs final submission
    });
  };

  const handleInputChange = (field: keyof WorkflowRequestData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Campus Services Work Request
          </CardTitle>
          <p className="text-gray-600">
            Create a new maintenance request following the 6-phase workflow process
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Request Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief description of the request"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-sm text-red-600">{errors.priority}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the maintenance request"
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleInputChange('location', value)}
              >
                <SelectTrigger className={errors.location ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location && <p className="text-sm text-red-600">{errors.location}</p>}
            </div>
          </div>

          {/* Work Type and Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="workType">Work Type</Label>
              <Select
                value={formData.workType}
                onValueChange={(value) => handleInputChange('workType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                  <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                  <SelectItem value="MIXED">Mixed (Internal + Contractor)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="originationSource">Request Source</Label>
              <Select
                value={formData.originationSource}
                onValueChange={(value) => handleInputChange('originationSource', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER_REQUEST">Customer Request</SelectItem>
                  <SelectItem value="INSPECTION_ROUNDS">Inspection Rounds</SelectItem>
                  <SelectItem value="PREVENTIVE_MAINTENANCE">Preventive Maintenance</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Internal vs Contractor Assessment */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Internal vs Contractor Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  id="canPerformInternally"
                  checked={formData.canPerformInternally}
                  onChange={(e) => handleInputChange('canPerformInternally', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="canPerformInternally" className="text-sm">
                  Can Campus Services perform this work internally?
                </Label>
              </div>

              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  id="requiresContractor"
                  checked={formData.requiresContractor}
                  onChange={(e) => handleInputChange('requiresContractor', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="requiresContractor" className="text-sm">
                  Does this work require contractor involvement?
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Estimates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Estimated Cost (TTD)</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={formData.estimatedCost || ''}
                onChange={(e) => handleInputChange('estimatedCost', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0.00"
                className={errors.estimatedCost ? 'border-red-500' : ''}
              />
              {errors.estimatedCost && <p className="text-sm text-red-600">{errors.estimatedCost}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedDuration">Estimated Duration (Hours)</Label>
              <Input
                id="estimatedDuration"
                type="number"
                value={formData.estimatedDuration || ''}
                onChange={(e) => handleInputChange('estimatedDuration', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                className={errors.estimatedDuration ? 'border-red-500' : ''}
              />
              {errors.estimatedDuration && <p className="text-sm text-red-600">{errors.estimatedDuration}</p>}
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => handleInputChange('dueDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </Button>
            
            <Button
              onClick={() => handleSubmit(false)}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Request
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowRequestForm;
