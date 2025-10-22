import express from 'express';
import { prisma } from '../../utils/prisma';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createWorkflowRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  workType: z.enum(['INTERNAL', 'CONTRACTOR', 'MIXED']).optional(),
  originationSource: z.enum(['CUSTOMER_REQUEST', 'INSPECTION_ROUNDS', 'EMERGENCY', 'PREVENTIVE_MAINTENANCE']).optional(),
  location: z.string().optional(),
  estimatedDuration: z.number().min(0).optional(),
  estimatedCost: z.number().min(0).optional(),
  dueDate: z.string().datetime().optional(),
  assignedToId: z.string().optional(),
});

const updateWorkflowPhaseSchema = z.object({
  phase: z.enum(['ORIGINATION', 'PLANNING', 'SCHEDULING', 'EXECUTION', 'FEEDBACK', 'EVALUATION']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']),
  notes: z.string().optional(),
});

// GET /api/v1/campus-services/workflow/requests - Get all workflow requests
router.get('/requests', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR, Role.TECHNICIAN]), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, priority, workType, phase, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { workOrderNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (workType) {
      where.workType = workType;
    }
    
    if (phase) {
      where.workflowPhases = {
        some: {
          phase: phase,
        },
      };
    }
    
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;
    
    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              displayName: true,
              email: true,
              role: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              displayName: true,
              email: true,
              role: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
            },
          },
          workflowPhases: {
            orderBy: {
              phase: 'asc',
            },
          },
          contractorAssignments: {
            include: {
              vendor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          purchaseOrders: {
            include: {
              items: true,
            },
          },
          workExecutionLogs: {
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                },
              },
            },
          },
          workQualityChecks: {
            include: {
              user: {
                select: {
                  id: true,
                  displayName: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.workOrder.count({ where }),
    ]);
    
    // Transform work orders to match the expected format
    const workflowRequests = workOrders.map(workOrder => ({
      id: workOrder.id,
      title: workOrder.title,
      description: workOrder.description,
      status: workOrder.status,
      priority: workOrder.priority,
      workType: workOrder.workType || 'INTERNAL',
      originationSource: workOrder.originationSource || 'CUSTOMER_REQUEST',
      location: workOrder.location?.name || workOrder.locationName || 'Not specified',
      createdAt: workOrder.createdAt.toISOString(),
      dueDate: workOrder.dueDate?.toISOString(),
      workflowPhases: workOrder.workflowPhases.map(phase => ({
        phase: phase.phase,
        status: phase.status,
        startedAt: phase.startedAt?.toISOString(),
        completedAt: phase.completedAt?.toISOString(),
        notes: phase.notes,
      })),
      contractorAssignments: workOrder.contractorAssignments.map(assignment => ({
        vendorId: assignment.vendorId,
        assignmentType: assignment.assignmentType,
        status: assignment.status,
        vendor: assignment.vendor,
      })),
      purchaseOrders: workOrder.purchaseOrders.map(po => ({
        poNumber: po.poNumber,
        status: po.status,
        totalAmount: po.totalAmount,
      })),
      workExecutionLogs: workOrder.workExecutionLogs.map(log => ({
        activity: log.activity,
        notes: log.notes,
        user: log.user,
        timestamp: log.timestamp.toISOString(),
      })),
      workQualityChecks: workOrder.workQualityChecks.map(check => ({
        qualityRating: check.qualityRating,
        timePerformanceRating: check.timePerformanceRating,
        costPerformanceRating: check.costPerformanceRating,
        approvedForClosure: check.approvedForClosure,
        user: check.user,
      })),
    }));
    
    res.json({
      data: workflowRequests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get workflow requests error:', error);
    res.status(500).json({ error: 'Failed to fetch workflow requests' });
  }
});

// GET /api/v1/campus-services/workflow/requests/:id - Get workflow request details
router.get('/requests/:id', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR, Role.TECHNICIAN]), async (req, res) => {
  try {
    const { id } = req.params;
    
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        workflowPhases: {
          orderBy: {
            phase: 'asc',
          },
        },
        contractorAssignments: {
          include: {
            vendor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        purchaseOrders: {
          include: {
            items: true,
          },
        },
        workExecutionLogs: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
        workQualityChecks: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
    
    if (!workOrder) {
      return res.status(404).json({ error: 'Workflow request not found' });
    }
    
    // Transform work order to match the expected format
    const workflowRequest = {
      id: workOrder.id,
      title: workOrder.title,
      description: workOrder.description,
      status: workOrder.status,
      priority: workOrder.priority,
      workType: workOrder.workType || 'INTERNAL',
      originationSource: workOrder.originationSource || 'CUSTOMER_REQUEST',
      location: workOrder.location?.name || workOrder.locationName || 'Not specified',
      createdAt: workOrder.createdAt.toISOString(),
      dueDate: workOrder.dueDate?.toISOString(),
      workflowPhases: workOrder.workflowPhases.map(phase => ({
        phase: phase.phase,
        status: phase.status,
        startedAt: phase.startedAt?.toISOString(),
        completedAt: phase.completedAt?.toISOString(),
        notes: phase.notes,
      })),
      contractorAssignments: workOrder.contractorAssignments.map(assignment => ({
        vendorId: assignment.vendorId,
        assignmentType: assignment.assignmentType,
        status: assignment.status,
        vendor: assignment.vendor,
      })),
      purchaseOrders: workOrder.purchaseOrders.map(po => ({
        poNumber: po.poNumber,
        status: po.status,
        totalAmount: po.totalAmount,
      })),
      workExecutionLogs: workOrder.workExecutionLogs.map(log => ({
        activity: log.activity,
        notes: log.notes,
        user: log.user,
        timestamp: log.timestamp.toISOString(),
      })),
      workQualityChecks: workOrder.workQualityChecks.map(check => ({
        qualityRating: check.qualityRating,
        timePerformanceRating: check.timePerformanceRating,
        costPerformanceRating: check.costPerformanceRating,
        approvedForClosure: check.approvedForClosure,
        user: check.user,
      })),
    };
    
    res.json({ data: workflowRequest });
  } catch (error) {
    console.error('Get workflow request error:', error);
    res.status(500).json({ error: 'Failed to fetch workflow request' });
  }
});

// PATCH /api/v1/campus-services/workflow/requests/:id/phases - Update workflow phase
router.patch('/requests/:id/phases', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateWorkflowPhaseSchema.parse(req.body);
    const user = req.user;
    
    // Check if work order exists
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
    });
    
    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }
    
    // Update the workflow phase
    const updatedPhase = await prisma.workflowPhase.updateMany({
      where: {
        workOrderId: id,
        phase: validatedData.phase,
      },
      data: {
        status: validatedData.status,
        notes: validatedData.notes,
        ...(validatedData.status === 'IN_PROGRESS' && { startedAt: new Date() }),
        ...(validatedData.status === 'COMPLETED' && { completedAt: new Date() }),
      },
    });
    
    if (updatedPhase.count === 0) {
      return res.status(404).json({ error: 'Workflow phase not found' });
    }
    
    // Get updated work order with phases
    const updatedWorkOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        workflowPhases: {
          orderBy: {
            phase: 'asc',
          },
        },
      },
    });
    
    res.json({ data: updatedWorkOrder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update workflow phase error:', error);
    res.status(500).json({ error: 'Failed to update workflow phase' });
  }
});

// GET /api/v1/campus-services/workflow/analytics - Get workflow analytics
router.get('/analytics', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get phase statistics
    const phaseStats = await prisma.workflowPhase.groupBy({
      by: ['phase', 'status'],
      where: {
        workOrder: {
          createdAt: {
            gte: startDate,
          },
        },
      },
      _count: {
        id: true,
      },
    });
    
    // Get work order statistics by phase
    const workOrderPhaseStats = await prisma.workOrder.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
        },
        workflowPhases: {
          some: {},
        },
      },
      _count: {
        id: true,
      },
    });
    
    // Get average completion time by phase
    const avgCompletionTime = await prisma.workflowPhase.groupBy({
      by: ['phase'],
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: startDate,
        },
      },
      _avg: {
        // Calculate duration if we have both startedAt and completedAt
      },
    });
    
    res.json({
      data: {
        phaseStats,
        workOrderPhaseStats,
        avgCompletionTime,
        period: days,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get workflow analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch workflow analytics' });
  }
});

export default router;