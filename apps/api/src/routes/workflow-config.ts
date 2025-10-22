import express from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createWorkflowPhaseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  phaseType: z.enum(['ORIGINATION', 'PLANNING', 'SCHEDULING', 'EXECUTION', 'FEEDBACK', 'EVALUATION']),
  order: z.number().min(0),
  isActive: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
  approvalRoles: z.array(z.string()).optional(),
  slaHours: z.number().min(0).optional(),
  autoAdvance: z.boolean().optional(),
  conditions: z.any().optional(),
});

const updateWorkflowPhaseSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  phaseType: z.enum(['ORIGINATION', 'PLANNING', 'SCHEDULING', 'EXECUTION', 'FEEDBACK', 'EVALUATION']).optional(),
  order: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
  approvalRoles: z.array(z.string()).optional(),
  slaHours: z.number().min(0).optional(),
  autoAdvance: z.boolean().optional(),
  conditions: z.any().optional(),
});

const createWorkflowRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  triggerPhase: z.string(),
  conditions: z.any(),
  actions: z.array(z.object({
    type: z.enum(['ASSIGN', 'NOTIFY', 'AUTO_ADVANCE', 'REQUIRE_APPROVAL', 'SET_PRIORITY', 'UPDATE_STATUS']),
    parameters: z.any(),
  })),
  isActive: z.boolean().optional(),
  priority: z.number().min(0).optional(),
});

const updateWorkflowRuleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  triggerPhase: z.string().optional(),
  conditions: z.any().optional(),
  actions: z.array(z.object({
    type: z.enum(['ASSIGN', 'NOTIFY', 'AUTO_ADVANCE', 'REQUIRE_APPROVAL', 'SET_PRIORITY', 'UPDATE_STATUS']),
    parameters: z.any(),
  })).optional(),
  isActive: z.boolean().optional(),
  priority: z.number().min(0).optional(),
});

const createSlaSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  phaseId: z.string(),
  targetHours: z.number().min(0),
  warningHours: z.number().min(0).optional(),
  escalationRoles: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const updateSlaSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  phaseId: z.string().optional(),
  targetHours: z.number().min(0).optional(),
  warningHours: z.number().min(0).optional(),
  escalationRoles: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/v1/workflow-config/phases - Get all workflow phases
router.get('/phases', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive, sortBy = 'order', sortOrder = 'asc' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;
    
    const [phases, total] = await Promise.all([
      prisma.workflowPhase.findMany({
        where,
        include: {
          sla: {
            select: {
              id: true,
              name: true,
              targetHours: true,
              warningHours: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              workOrders: true,
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.workflowPhase.count({ where }),
    ]);
    
    res.json({
      data: phases,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get workflow phases error:', error);
    res.status(500).json({ error: 'Failed to fetch workflow phases' });
  }
});

// POST /api/v1/workflow-config/phases - Create new workflow phase
router.post('/phases', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const validatedData = createWorkflowPhaseSchema.parse(req.body);
    
    // Check if phase with same order already exists
    const existingPhase = await prisma.workflowPhase.findFirst({
      where: { order: validatedData.order },
    });
    
    if (existingPhase) {
      return res.status(400).json({ 
        error: 'A phase with this order already exists. Please choose a different order.' 
      });
    }
    
    const phase = await prisma.workflowPhase.create({
      data: validatedData,
    });
    
    res.status(201).json({ data: phase });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create workflow phase error:', error);
    res.status(500).json({ error: 'Failed to create workflow phase' });
  }
});

// PATCH /api/v1/workflow-config/phases/:id - Update workflow phase
router.patch('/phases/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateWorkflowPhaseSchema.parse(req.body);
    
    // Check if phase with same order already exists (excluding current phase)
    if (validatedData.order !== undefined) {
      const existingPhase = await prisma.workflowPhase.findFirst({
        where: { 
          order: validatedData.order,
          id: { not: id },
        },
      });
      
      if (existingPhase) {
        return res.status(400).json({ 
          error: 'A phase with this order already exists. Please choose a different order.' 
        });
      }
    }
    
    const phase = await prisma.workflowPhase.update({
      where: { id },
      data: validatedData,
    });
    
    res.json({ data: phase });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update workflow phase error:', error);
    res.status(500).json({ error: 'Failed to update workflow phase' });
  }
});

// DELETE /api/v1/workflow-config/phases/:id - Delete workflow phase
router.delete('/phases/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if phase has work orders
    const workOrdersCount = await prisma.workOrder.count({
      where: {
        workflowPhases: {
          some: {
            phaseId: id,
          },
        },
      },
    });
    
    if (workOrdersCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete phase with associated work orders. Please reassign or complete work orders first.' 
      });
    }
    
    await prisma.workflowPhase.delete({
      where: { id },
    });
    
    res.json({ message: 'Workflow phase deleted successfully' });
  } catch (error) {
    console.error('Delete workflow phase error:', error);
    res.status(500).json({ error: 'Failed to delete workflow phase' });
  }
});

// GET /api/v1/workflow-config/rules - Get all workflow rules
router.get('/rules', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive, triggerPhase, sortBy = 'priority', sortOrder = 'desc' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (triggerPhase) {
      where.triggerPhase = triggerPhase;
    }
    
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;
    
    const [rules, total] = await Promise.all([
      prisma.workflowRule.findMany({
        where,
        include: {
          phase: {
            select: {
              id: true,
              name: true,
              phaseType: true,
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.workflowRule.count({ where }),
    ]);
    
    res.json({
      data: rules,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get workflow rules error:', error);
    res.status(500).json({ error: 'Failed to fetch workflow rules' });
  }
});

// POST /api/v1/workflow-config/rules - Create new workflow rule
router.post('/rules', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const validatedData = createWorkflowRuleSchema.parse(req.body);
    
    // Check if trigger phase exists
    const phase = await prisma.workflowPhase.findUnique({
      where: { id: validatedData.triggerPhase },
    });
    
    if (!phase) {
      return res.status(404).json({ error: 'Trigger phase not found' });
    }
    
    const rule = await prisma.workflowRule.create({
      data: validatedData,
      include: {
        phase: {
          select: {
            id: true,
            name: true,
            phaseType: true,
          },
        },
      },
    });
    
    res.status(201).json({ data: rule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create workflow rule error:', error);
    res.status(500).json({ error: 'Failed to create workflow rule' });
  }
});

// PATCH /api/v1/workflow-config/rules/:id - Update workflow rule
router.patch('/rules/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateWorkflowRuleSchema.parse(req.body);
    
    // Check if trigger phase exists (if provided)
    if (validatedData.triggerPhase) {
      const phase = await prisma.workflowPhase.findUnique({
        where: { id: validatedData.triggerPhase },
      });
      
      if (!phase) {
        return res.status(404).json({ error: 'Trigger phase not found' });
      }
    }
    
    const rule = await prisma.workflowRule.update({
      where: { id },
      data: validatedData,
      include: {
        phase: {
          select: {
            id: true,
            name: true,
            phaseType: true,
          },
        },
      },
    });
    
    res.json({ data: rule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update workflow rule error:', error);
    res.status(500).json({ error: 'Failed to update workflow rule' });
  }
});

// DELETE /api/v1/workflow-config/rules/:id - Delete workflow rule
router.delete('/rules/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.workflowRule.delete({
      where: { id },
    });
    
    res.json({ message: 'Workflow rule deleted successfully' });
  } catch (error) {
    console.error('Delete workflow rule error:', error);
    res.status(500).json({ error: 'Failed to delete workflow rule' });
  }
});

// GET /api/v1/workflow-config/slas - Get all SLAs
router.get('/slas', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive, phaseId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (phaseId) {
      where.phaseId = phaseId;
    }
    
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;
    
    const [slas, total] = await Promise.all([
      prisma.sla.findMany({
        where,
        include: {
          phase: {
            select: {
              id: true,
              name: true,
              phaseType: true,
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.sla.count({ where }),
    ]);
    
    res.json({
      data: slas,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get SLAs error:', error);
    res.status(500).json({ error: 'Failed to fetch SLAs' });
  }
});

// POST /api/v1/workflow-config/slas - Create new SLA
router.post('/slas', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const validatedData = createSlaSchema.parse(req.body);
    
    // Check if phase exists
    const phase = await prisma.workflowPhase.findUnique({
      where: { id: validatedData.phaseId },
    });
    
    if (!phase) {
      return res.status(404).json({ error: 'Phase not found' });
    }
    
    // Check if SLA already exists for this phase
    const existingSla = await prisma.sla.findFirst({
      where: { phaseId: validatedData.phaseId },
    });
    
    if (existingSla) {
      return res.status(400).json({ 
        error: 'SLA already exists for this phase. Please update the existing SLA instead.' 
      });
    }
    
    const sla = await prisma.sla.create({
      data: validatedData,
      include: {
        phase: {
          select: {
            id: true,
            name: true,
            phaseType: true,
          },
        },
      },
    });
    
    res.status(201).json({ data: sla });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create SLA error:', error);
    res.status(500).json({ error: 'Failed to create SLA' });
  }
});

// PATCH /api/v1/workflow-config/slas/:id - Update SLA
router.patch('/slas/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateSlaSchema.parse(req.body);
    
    // Check if phase exists (if provided)
    if (validatedData.phaseId) {
      const phase = await prisma.workflowPhase.findUnique({
        where: { id: validatedData.phaseId },
      });
      
      if (!phase) {
        return res.status(404).json({ error: 'Phase not found' });
      }
    }
    
    const sla = await prisma.sla.update({
      where: { id },
      data: validatedData,
      include: {
        phase: {
          select: {
            id: true,
            name: true,
            phaseType: true,
          },
        },
      },
    });
    
    res.json({ data: sla });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update SLA error:', error);
    res.status(500).json({ error: 'Failed to update SLA' });
  }
});

// DELETE /api/v1/workflow-config/slas/:id - Delete SLA
router.delete('/slas/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.sla.delete({
      where: { id },
    });
    
    res.json({ message: 'SLA deleted successfully' });
  } catch (error) {
    console.error('Delete SLA error:', error);
    res.status(500).json({ error: 'Failed to delete SLA' });
  }
});

// GET /api/v1/workflow-config/analytics - Get workflow configuration analytics
router.get('/analytics', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get phase statistics
    const phaseStats = await prisma.workflowPhase.groupBy({
      by: ['phaseType'],
      _count: {
        id: true,
      },
    });
    
    // Get rule statistics
    const ruleStats = await prisma.workflowRule.groupBy({
      by: ['isActive'],
      _count: {
        id: true,
      },
    });
    
    // Get SLA statistics
    const slaStats = await prisma.sla.groupBy({
      by: ['isActive'],
      _count: {
        id: true,
      },
      _avg: {
        targetHours: true,
        warningHours: true,
      },
    });
    
    // Get work order phase distribution
    const workOrderPhaseStats = await prisma.workOrder.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    });
    
    // Get recent workflow activities
    const recentActivities = await prisma.workflowPhase.findMany({
      where: {
        updatedAt: {
          gte: startDate,
        },
      },
      include: {
        _count: {
          select: {
            workOrders: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
    });
    
    res.json({
      data: {
        phaseStats,
        ruleStats,
        slaStats,
        workOrderPhaseStats,
        recentActivities,
        period: days,
      },
    });
  } catch (error) {
    console.error('Get workflow analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch workflow analytics' });
  }
});

// POST /api/v1/workflow-config/validate - Validate workflow configuration
router.post('/validate', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { phases, rules, slas } = req.body;
    
    const validationResults = {
      phases: [],
      rules: [],
      slas: [],
      overall: { valid: true, errors: [] },
    };
    
    // Validate phases
    if (phases && Array.isArray(phases)) {
      for (const phase of phases) {
        const phaseValidation = { id: phase.id, valid: true, errors: [] };
        
        // Check for duplicate orders
        const duplicateOrder = phases.filter(p => p.order === phase.order && p.id !== phase.id);
        if (duplicateOrder.length > 0) {
          phaseValidation.valid = false;
          phaseValidation.errors.push('Duplicate order number');
        }
        
        // Check for missing required fields
        if (!phase.name) {
          phaseValidation.valid = false;
          phaseValidation.errors.push('Name is required');
        }
        
        if (!phase.phaseType) {
          phaseValidation.valid = false;
          phaseValidation.errors.push('Phase type is required');
        }
        
        validationResults.phases.push(phaseValidation);
        
        if (!phaseValidation.valid) {
          validationResults.overall.valid = false;
          validationResults.overall.errors.push(`Phase ${phase.name}: ${phaseValidation.errors.join(', ')}`);
        }
      }
    }
    
    // Validate rules
    if (rules && Array.isArray(rules)) {
      for (const rule of rules) {
        const ruleValidation = { id: rule.id, valid: true, errors: [] };
        
        // Check if trigger phase exists
        if (rule.triggerPhase) {
          const phase = phases?.find(p => p.id === rule.triggerPhase);
          if (!phase) {
            ruleValidation.valid = false;
            ruleValidation.errors.push('Trigger phase not found');
          }
        }
        
        // Check for required fields
        if (!rule.name) {
          ruleValidation.valid = false;
          ruleValidation.errors.push('Name is required');
        }
        
        if (!rule.actions || !Array.isArray(rule.actions) || rule.actions.length === 0) {
          ruleValidation.valid = false;
          ruleValidation.errors.push('At least one action is required');
        }
        
        validationResults.rules.push(ruleValidation);
        
        if (!ruleValidation.valid) {
          validationResults.overall.valid = false;
          validationResults.overall.errors.push(`Rule ${rule.name}: ${ruleValidation.errors.join(', ')}`);
        }
      }
    }
    
    // Validate SLAs
    if (slas && Array.isArray(slas)) {
      for (const sla of slas) {
        const slaValidation = { id: sla.id, valid: true, errors: [] };
        
        // Check if phase exists
        if (sla.phaseId) {
          const phase = phases?.find(p => p.id === sla.phaseId);
          if (!phase) {
            slaValidation.valid = false;
            slaValidation.errors.push('Phase not found');
          }
        }
        
        // Check for required fields
        if (!sla.name) {
          slaValidation.valid = false;
          slaValidation.errors.push('Name is required');
        }
        
        if (!sla.targetHours || sla.targetHours <= 0) {
          slaValidation.valid = false;
          slaValidation.errors.push('Target hours must be greater than 0');
        }
        
        validationResults.slas.push(slaValidation);
        
        if (!slaValidation.valid) {
          validationResults.overall.valid = false;
          validationResults.overall.errors.push(`SLA ${sla.name}: ${slaValidation.errors.join(', ')}`);
        }
      }
    }
    
    res.json({ data: validationResults });
  } catch (error) {
    console.error('Validate workflow configuration error:', error);
    res.status(500).json({ error: 'Failed to validate workflow configuration' });
  }
});

export default router;
