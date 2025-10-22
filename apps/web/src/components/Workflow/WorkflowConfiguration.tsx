import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  DollarSign
} from 'lucide-react';

interface WorkflowPhase {
  id: string;
  name: string;
  description?: string;
  phaseType: string;
  order: number;
  isActive: boolean;
  requiresApproval: boolean;
  approvalRoles: string[];
  slaHours?: number;
  autoAdvance: boolean;
  conditions?: any;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowRule {
  id: string;
  name: string;
  description?: string;
  triggerPhase: string;
  conditions: any;
  actions: Array<{
    type: string;
    parameters: any;
  }>;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface SLA {
  id: string;
  name: string;
  description?: string;
  phaseId: string;
  targetHours: number;
  warningHours?: number;
  escalationRoles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const WorkflowConfiguration: React.FC = () => {
  const [phases, setPhases] = useState<WorkflowPhase[]>([]);
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [slas, setSlas] = useState<SLA[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('phases');
  const [editingPhase, setEditingPhase] = useState<WorkflowPhase | null>(null);
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);
  const [editingSLA, setEditingSLA] = useState<SLA | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch phases
      const phasesResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://10.2.1.27:4000/api/v1'}/workflow-config/phases`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (phasesResponse.ok) {
        const phasesData = await phasesResponse.json();
        setPhases(phasesData.data || []);
      }

      // Fetch rules
      const rulesResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://10.2.1.27:4000/api/v1'}/workflow-config/rules`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json();
        setRules(rulesData.data || []);
      }

      // Fetch SLAs
      const slasResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://10.2.1.27:4000/api/v1'}/workflow-config/slas`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (slasResponse.ok) {
        const slasData = await slasResponse.json();
        setSlas(slasData.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePhase = async (phaseData: Partial<WorkflowPhase>) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingPhase 
        ? `${import.meta.env.VITE_API_URL || 'http://10.2.1.27:4000/api/v1'}/workflow-config/phases/${editingPhase.id}`
        : `${import.meta.env.VITE_API_URL || 'http://10.2.1.27:4000/api/v1'}/workflow-config/phases`;
      
      const method = editingPhase ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(phaseData),
      });
      
      if (!response.ok) throw new Error('Failed to save phase');
      
      setEditingPhase(null);
      fetchData();
    } catch (err) {
      alert('Failed to save phase: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleDeletePhase = async (id: string) => {
    if (!confirm('Are you sure you want to delete this phase?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://10.2.1.27:4000/api/v1'}/workflow-config/phases/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to delete phase');
      
      fetchData();
    } catch (err) {
      alert('Failed to delete phase: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workflow Configuration</h2>
          <p className="text-gray-600">Configure workflow phases, approval processes, and automation rules</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="phases">Workflow Phases</TabsTrigger>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="slas">SLA Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="phases" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Workflow Phases</h3>
            <Button onClick={() => setEditingPhase({} as WorkflowPhase)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Phase
            </Button>
          </div>

          <div className="space-y-4">
            {phases.map((phase) => (
              <Card key={phase.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{phase.name}</h4>
                        <Badge className={phase.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {phase.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">Order: {phase.order}</Badge>
                      </div>
                      {phase.description && (
                        <p className="text-gray-600 mb-2">{phase.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Type: {phase.phaseType}</span>
                        {phase.requiresApproval && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Requires Approval
                          </span>
                        )}
                        {phase.slaHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            SLA: {phase.slaHours}h
                          </span>
                        )}
                        {phase.autoAdvance && (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Auto Advance
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingPhase(phase)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeletePhase(phase.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Automation Rules</h3>
            <Button onClick={() => setEditingRule({} as WorkflowRule)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>

          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{rule.name}</h4>
                        <Badge className={rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">Priority: {rule.priority}</Badge>
                      </div>
                      {rule.description && (
                        <p className="text-gray-600 mb-2">{rule.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Trigger: {rule.triggerPhase}</span>
                        <span>Actions: {rule.actions.length}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingRule(rule)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="slas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">SLA Configuration</h3>
            <Button onClick={() => setEditingSLA({} as SLA)}>
              <Plus className="w-4 h-4 mr-2" />
              Add SLA
            </Button>
          </div>

          <div className="space-y-4">
            {slas.map((sla) => (
              <Card key={sla.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{sla.name}</h4>
                        <Badge className={sla.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {sla.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {sla.description && (
                        <p className="text-gray-600 mb-2">{sla.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Target: {sla.targetHours}h</span>
                        {sla.warningHours && (
                          <span>Warning: {sla.warningHours}h</span>
                        )}
                        <span>Escalation: {sla.escalationRoles.length} roles</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingSLA(sla)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Phase Edit Modal */}
      {editingPhase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingPhase.id ? 'Edit Phase' : 'Add Phase'}
                <Button variant="ghost" onClick={() => setEditingPhase(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhaseEditForm
                phase={editingPhase}
                onSave={handleSavePhase}
                onCancel={() => setEditingPhase(null)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Phase Edit Form Component
const PhaseEditForm: React.FC<{
  phase: Partial<WorkflowPhase>;
  onSave: (data: Partial<WorkflowPhase>) => void;
  onCancel: () => void;
}> = ({ phase, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: phase.name || '',
    description: phase.description || '',
    phaseType: phase.phaseType || 'ORIGINATION',
    order: phase.order || 0,
    isActive: phase.isActive ?? true,
    requiresApproval: phase.requiresApproval ?? false,
    approvalRoles: phase.approvalRoles || [],
    slaHours: phase.slaHours || 0,
    autoAdvance: phase.autoAdvance ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Phase Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phaseType">Phase Type *</Label>
          <Select value={formData.phaseType} onValueChange={(value) => setFormData({ ...formData, phaseType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ORIGINATION">Origination</SelectItem>
              <SelectItem value="PLANNING">Planning</SelectItem>
              <SelectItem value="SCHEDULING">Scheduling</SelectItem>
              <SelectItem value="EXECUTION">Execution</SelectItem>
              <SelectItem value="FEEDBACK">Feedback</SelectItem>
              <SelectItem value="EVALUATION">Evaluation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="order">Order *</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="slaHours">SLA Hours</Label>
        <Input
          id="slaHours"
          type="number"
          value={formData.slaHours}
          onChange={(e) => setFormData({ ...formData, slaHours: Number(e.target.value) })}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="requiresApproval"
            checked={formData.requiresApproval}
            onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
          />
          <Label htmlFor="requiresApproval">Requires Approval</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoAdvance"
            checked={formData.autoAdvance}
            onChange={(e) => setFormData({ ...formData, autoAdvance: e.target.checked })}
          />
          <Label htmlFor="autoAdvance">Auto Advance</Label>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Save Phase
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default WorkflowConfiguration;
