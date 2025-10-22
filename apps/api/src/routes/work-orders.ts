import express from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { emailService } from '../services/EmailService';

const router = express.Router();

// Validation schemas
const createWorkOrderSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  category: z.string().min(1),
  location: z.string().min(1),
  assignedToId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0).optional(),
  estimatedDuration: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

const updateWorkOrderSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  category: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD']).optional(),
  assignedToId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

const addCommentSchema = z.object({
  content: z.string().min(1),
  isInternal: z.boolean().optional(),
});

// GET /api/v1/work-orders - Get all work orders
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      priority, 
      category, 
      assignedTo,
      createdBy,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const user = req.user;

    const where: any = {};
    
    // Role-based filtering
    if (user.role === Role.TECHNICIAN) {
      where.OR = [
        { assignedToId: user.id },
        { createdById: user.id },
      ];
    } else if (user.role === Role.SUPERVISOR) {
      // Supervisors can see all work orders in their department
      where.OR = [
        { createdBy: { department: user.department } },
        { assignedTo: { department: user.department } },
      ];
    }
    // Admins can see all work orders (no additional filtering)
    
    if (search) {
      where.AND = [
        where.AND || {},
        {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
            { workOrderNumber: { contains: search as string, mode: 'insensitive' } },
          ],
        },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (assignedTo) {
      where.assignedToId = assignedTo;
    }
    
    if (createdBy) {
      where.createdById = createdBy;
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
          comments: {
            select: {
              id: true,
              content: true,
              isInternal: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  displayName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 3, // Only get latest 3 comments
          },
          attachments: {
            select: {
              id: true,
              filename: true,
              size: true,
              mimeType: true,
              createdAt: true,
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.workOrder.count({ where }),
    ]);

    res.json({
      data: workOrders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
});

// GET /api/v1/work-orders/:id - Get work order by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            department: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            department: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
      },
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    // Check permissions
    if (user.role === Role.TECHNICIAN && 
        workOrder.assignedToId !== user.id && 
        workOrder.createdById !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ data: workOrder });
  } catch (error) {
    console.error('Get work order error:', error);
    res.status(500).json({ error: 'Failed to fetch work order' });
  }
});

// POST /api/v1/work-orders - Create new work order
router.post('/', authenticate, async (req, res) => {
  try {
    const validatedData = createWorkOrderSchema.parse(req.body);
    const user = req.user;

    // Generate work order number
    const workOrderCount = await prisma.workOrder.count();
    const workOrderNumber = `WO-${String(workOrderCount + 1).padStart(4, '0')}`;

    const { estimatedHours, ...dataWithoutEstimatedHours } = validatedData;
    const workOrder = await prisma.workOrder.create({
      data: {
        ...dataWithoutEstimatedHours,
        estimatedDuration: estimatedHours || validatedData.estimatedDuration,
        workOrderNumber,
        createdById: user.userId,
        status: 'OPEN',
        // Initialize Campus Services Work Process
        workflowPhases: {
          create: [
            {
              phase: 'ORIGINATION',
              status: 'COMPLETED',
              startedAt: new Date(),
              completedAt: new Date(),
              notes: 'Work order created and entered into CMMS system',
            },
            {
              phase: 'PLANNING',
              status: 'PENDING',
              notes: 'Awaiting planning and resource validation',
            },
            {
              phase: 'SCHEDULING',
              status: 'PENDING',
              notes: 'Awaiting resource assignment and authorization',
            },
            {
              phase: 'EXECUTION',
              status: 'PENDING',
              notes: 'Awaiting work performance',
            },
            {
              phase: 'FEEDBACK',
              status: 'PENDING',
              notes: 'Awaiting quality verification',
            },
            {
              phase: 'EVALUATION',
              status: 'PENDING',
              notes: 'Awaiting performance evaluation',
            },
          ],
        },
      },
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
        workflowPhases: {
          orderBy: {
            phase: 'asc',
          },
        },
      },
    });

    // Send email notification for new work order
    try {
      const recipients = ['CSD@costaatt.edu.tt'];
      if (workOrder.assignedTo?.email) {
        recipients.push(workOrder.assignedTo.email);
      }
      if (workOrder.createdBy?.email) {
        recipients.push(workOrder.createdBy.email);
      }
      
      await emailService.sendWorkOrderCreatedEmail(workOrder, recipients);
    } catch (emailError) {
      console.error('Failed to send work order creation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({ data: workOrder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create work order error:', error);
    res.status(500).json({ error: 'Failed to create work order' });
  }
});

// PATCH /api/v1/work-orders/:id - Update work order
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateWorkOrderSchema.parse(req.body);
    const user = req.user;

    // Check if work order exists
    const existingWorkOrder = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!existingWorkOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    // Check permissions
    if (user.role === Role.TECHNICIAN && 
        existingWorkOrder.assignedToId !== user.id && 
        existingWorkOrder.createdById !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If status is being changed to COMPLETED, set completedAt
    if (validatedData.status === 'COMPLETED') {
      validatedData.completedAt = new Date();
    }

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: validatedData,
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
      },
    });

    // Send email notification for work order update
    try {
      const recipients = ['CSD@costaatt.edu.tt'];
      if (workOrder.assignedTo?.email) {
        recipients.push(workOrder.assignedTo.email);
      }
      if (workOrder.createdBy?.email) {
        recipients.push(workOrder.createdBy.email);
      }
      
      const changes = [];
      if (validatedData.status && validatedData.status !== existingWorkOrder.status) {
        changes.push(`Status changed from ${existingWorkOrder.status} to ${validatedData.status}`);
      }
      if (validatedData.priority && validatedData.priority !== existingWorkOrder.priority) {
        changes.push(`Priority changed from ${existingWorkOrder.priority} to ${validatedData.priority}`);
      }
      if (validatedData.assignedToId && validatedData.assignedToId !== existingWorkOrder.assignedToId) {
        changes.push('Assignment changed');
      }
      
      if (changes.length > 0) {
        await emailService.sendWorkOrderUpdatedEmail(workOrder, recipients, changes);
      }
      
      // Send completion email if status changed to COMPLETED
      if (validatedData.status === 'COMPLETED') {
        await emailService.sendWorkOrderCompletedEmail(workOrder, recipients);
      }
    } catch (emailError) {
      console.error('Failed to send work order update email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({ data: workOrder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update work order error:', error);
    res.status(500).json({ error: 'Failed to update work order' });
  }
});

// DELETE /api/v1/work-orders/:id - Delete work order (Admin only)
router.delete('/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    await prisma.workOrder.delete({
      where: { id },
    });

    res.json({ message: 'Work order deleted successfully' });
  } catch (error) {
    console.error('Delete work order error:', error);
    res.status(500).json({ error: 'Failed to delete work order' });
  }
});

// POST /api/v1/work-orders/:id/comments - Add comment to work order
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = addCommentSchema.parse(req.body);
    const user = req.user;

    // Check if work order exists
    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    // Check permissions
    if (user.role === Role.TECHNICIAN && 
        workOrder.assignedToId !== user.id && 
        workOrder.createdById !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comment = await prisma.comment.create({
      data: {
        ...validatedData,
        workOrderId: id,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({ data: comment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// GET /api/v1/work-orders/stats - Get work order statistics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const user = req.user;
    const where: any = {};

    // Role-based filtering
    if (user.role === Role.TECHNICIAN) {
      where.OR = [
        { assignedToId: user.id },
        { createdById: user.id },
      ];
    } else if (user.role === Role.SUPERVISOR) {
      where.OR = [
        { createdBy: { department: user.department } },
        { assignedTo: { department: user.department } },
      ];
    }

    const [
      total,
      open,
      inProgress,
      completed,
      cancelled,
      byPriority,
      byCategory,
      recent,
      avgCompletionTime,
    ] = await Promise.all([
      prisma.workOrder.count({ where }),
      prisma.workOrder.count({ where: { ...where, status: 'OPEN' } }),
      prisma.workOrder.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.workOrder.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.workOrder.count({ where: { ...where, status: 'CANCELLED' } }),
      prisma.workOrder.groupBy({
        by: ['priority'],
        _count: { priority: true },
        where,
      }),
      prisma.workOrder.groupBy({
        by: ['category'],
        _count: { category: true },
        where,
      }),
      prisma.workOrder.count({
        where: {
          ...where,
          createdAt: { gte: startDate },
        },
      }),
      // Calculate average completion time
      prisma.workOrder.findMany({
        where: {
          ...where,
          status: 'COMPLETED',
          completedAt: { not: null },
        },
        select: {
          createdAt: true,
          completedAt: true,
        },
      }).then(orders => {
        if (orders.length === 0) return 0;
        const totalTime = orders.reduce((sum, order) => {
          return sum + (order.completedAt!.getTime() - order.createdAt.getTime());
        }, 0);
        return totalTime / orders.length / (1000 * 60 * 60); // Convert to hours
      }),
    ]);

    res.json({
      data: {
        total,
        open,
        inProgress,
        completed,
        cancelled,
        byPriority,
        byCategory,
        recent,
        avgCompletionTimeHours: Math.round(avgCompletionTime * 100) / 100,
      },
      period: `${days} days`,
    });
  } catch (error) {
    console.error('Get work order stats error:', error);
    res.status(500).json({ error: 'Failed to fetch work order statistics' });
  }
});

export default router;
