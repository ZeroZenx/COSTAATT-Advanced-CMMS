import express from 'express';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { Role } from '@prisma/client';

const router = express.Router();

// Validation schemas
const createSLAEventSchema = z.object({
  workOrderId: z.string(),
  targetAt: z.string().datetime(),
});

const updateSLAEventSchema = z.object({
  breached: z.boolean().optional(),
  resolvedAt: z.string().datetime().optional(),
  escalated: z.boolean().optional(),
});

// GET /api/v1/sla/events
router.get('/', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { breached, escalated, workOrderId } = req.query;
    
    const where: any = {};
    if (breached === 'true') where.breached = true;
    if (escalated === 'true') where.escalated = true;
    if (workOrderId) where.workOrderId = workOrderId;

    const slaEvents = await prisma.sLAEvent.findMany({
      where,
      include: {
        workOrder: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, email: true }
            },
            assignedTo: {
              select: { id: true, displayName: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate SLA statistics
    const totalEvents = await prisma.sLAEvent.count();
    const breachedEvents = await prisma.sLAEvent.count({ where: { breached: true } });
    const escalatedEvents = await prisma.sLAEvent.count({ where: { escalated: true } });
    const resolvedEvents = await prisma.sLAEvent.count({ where: { resolvedAt: { not: null } } });

    res.json({
      data: slaEvents,
      total: slaEvents.length,
      statistics: {
        total: totalEvents,
        breached: breachedEvents,
        escalated: escalatedEvents,
        resolved: resolvedEvents,
        breachRate: totalEvents > 0 ? (breachedEvents / totalEvents * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching SLA events:', error);
    res.status(500).json({ error: 'Failed to fetch SLA events' });
  }
});

// GET /api/v1/sla/events/:id
router.get('/:id', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { id } = req.params;
    
    const slaEvent = await prisma.sLAEvent.findUnique({
      where: { id },
      include: {
        workOrder: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, email: true }
            },
            assignedTo: {
              select: { id: true, displayName: true, email: true }
            },
            comments: {
              include: {
                user: {
                  select: { id: true, displayName: true }
                }
              },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    if (!slaEvent) {
      return res.status(404).json({ error: 'SLA event not found' });
    }

    res.json({ data: slaEvent });
  } catch (error) {
    console.error('Error fetching SLA event:', error);
    res.status(500).json({ error: 'Failed to fetch SLA event' });
  }
});

// POST /api/v1/sla/events
router.post('/', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const validatedData = createSLAEventSchema.parse(req.body);
    
    // Check if work order exists
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: validatedData.workOrderId }
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    // Check if SLA event already exists for this work order
    const existingSLA = await prisma.sLAEvent.findFirst({
      where: { workOrderId: validatedData.workOrderId }
    });

    if (existingSLA) {
      return res.status(409).json({ error: 'SLA event already exists for this work order' });
    }

    const slaEvent = await prisma.sLAEvent.create({
      data: {
        ...validatedData,
        targetAt: new Date(validatedData.targetAt),
      },
      include: {
        workOrder: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, email: true }
            },
            assignedTo: {
              select: { id: true, displayName: true, email: true }
            }
          }
        }
      }
    });

    res.status(201).json({ data: slaEvent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating SLA event:', error);
    res.status(500).json({ error: 'Failed to create SLA event' });
  }
});

// PATCH /api/v1/sla/events/:id
router.patch('/:id', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateSLAEventSchema.parse(req.body);
    
    const updateData: any = { ...validatedData };
    if (validatedData.resolvedAt) {
      updateData.resolvedAt = new Date(validatedData.resolvedAt);
    }

    const slaEvent = await prisma.sLAEvent.update({
      where: { id },
      data: updateData,
      include: {
        workOrder: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, email: true }
            },
            assignedTo: {
              select: { id: true, displayName: true, email: true }
            }
          }
        }
      }
    });

    res.json({ data: slaEvent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating SLA event:', error);
    res.status(500).json({ error: 'Failed to update SLA event' });
  }
});

// POST /api/v1/sla/events/:id/resolve
router.post('/:id/resolve', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { id } = req.params;
    
    const slaEvent = await prisma.sLAEvent.update({
      where: { id },
      data: {
        resolvedAt: new Date(),
        breached: false,
        escalated: false,
      },
      include: {
        workOrder: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, email: true }
            },
            assignedTo: {
              select: { id: true, displayName: true, email: true }
            }
          }
        }
      }
    });

    res.json({ data: slaEvent });
  } catch (error) {
    console.error('Error resolving SLA event:', error);
    res.status(500).json({ error: 'Failed to resolve SLA event' });
  }
});

// GET /api/v1/sla/breaches
router.get('/breaches/active', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const now = new Date();
    
    const breachedEvents = await prisma.sLAEvent.findMany({
      where: {
        breached: true,
        resolvedAt: null,
      },
      include: {
        workOrder: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, email: true }
            },
            assignedTo: {
              select: { id: true, displayName: true, email: true }
            }
          }
        }
      },
      orderBy: { targetAt: 'asc' }
    });

    // Also get events that are about to breach (within next hour)
    const upcomingBreaches = await prisma.sLAEvent.findMany({
      where: {
        breached: false,
        resolvedAt: null,
        targetAt: {
          lte: new Date(now.getTime() + 60 * 60 * 1000), // Next hour
          gte: now
        }
      },
      include: {
        workOrder: {
          include: {
            createdBy: {
              select: { id: true, displayName: true, email: true }
            },
            assignedTo: {
              select: { id: true, displayName: true, email: true }
            }
          }
        }
      },
      orderBy: { targetAt: 'asc' }
    });

    res.json({
      data: {
        breached: breachedEvents,
        upcoming: upcomingBreaches
      },
      total: breachedEvents.length + upcomingBreaches.length
    });
  } catch (error) {
    console.error('Error fetching SLA breaches:', error);
    res.status(500).json({ error: 'Failed to fetch SLA breaches' });
  }
});

export default router;
