import express from 'express';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';

const router = express.Router();

// Validation schemas
const createScheduleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assetId: z.string().min(1),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  nextDueDate: z.string().datetime(),
  assignedToId: z.string().optional(),
});

const updateScheduleSchema = createScheduleSchema.partial();

// GET /api/v1/maintenance/schedules
router.get('/', async (req, res) => {
  try {
    const schedules = await prisma.maintenanceSchedule.findMany({
      include: {
        assignedTo: {
          select: { id: true, displayName: true, email: true }
        },
        tasks: {
          include: {
            workOrder: {
              select: { id: true, title: true, status: true }
            },
            completedBy: {
              select: { id: true, displayName: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { nextDueDate: 'asc' }
    });

    res.json({
      data: schedules,
      total: schedules.length
    });
  } catch (error) {
    console.error('Error fetching maintenance schedules:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance schedules' });
  }
});

// GET /api/v1/maintenance/schedules/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const schedule = await prisma.maintenanceSchedule.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, displayName: true, email: true }
        },
        tasks: {
          include: {
            workOrder: {
              select: { id: true, title: true, status: true }
            },
            completedBy: {
              select: { id: true, displayName: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Maintenance schedule not found' });
    }

    res.json({ data: schedule });
  } catch (error) {
    console.error('Error fetching maintenance schedule:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance schedule' });
  }
});

// POST /api/v1/maintenance/schedules
router.post('/', async (req, res) => {
  try {
    const validatedData = createScheduleSchema.parse(req.body);
    
    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        ...validatedData,
        nextDueDate: new Date(validatedData.nextDueDate),
      },
      include: {
        assignedTo: {
          select: { id: true, displayName: true, email: true }
        }
      }
    });

    res.status(201).json({ data: schedule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating maintenance schedule:', error);
    res.status(500).json({ error: 'Failed to create maintenance schedule' });
  }
});

// PATCH /api/v1/maintenance/schedules/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateScheduleSchema.parse(req.body);
    
    const updateData: any = { ...validatedData };
    if (validatedData.nextDueDate) {
      updateData.nextDueDate = new Date(validatedData.nextDueDate);
    }

    const schedule = await prisma.maintenanceSchedule.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, displayName: true, email: true }
        }
      }
    });

    res.json({ data: schedule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating maintenance schedule:', error);
    res.status(500).json({ error: 'Failed to update maintenance schedule' });
  }
});

// POST /api/v1/maintenance/schedules/:id/run
router.post('/:id/run', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the schedule
    const schedule = await prisma.maintenanceSchedule.findUnique({
      where: { id },
      include: { assignedTo: true }
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Maintenance schedule not found' });
    }

    // Create a work order for this maintenance task
    const workOrder = await prisma.workOrder.create({
      data: {
        title: `PM: ${schedule.title}`,
        description: schedule.description || `Preventive maintenance for ${schedule.assetId}`,
        location: schedule.assetId,
        category: 'Preventive Maintenance',
        priority: 'MEDIUM',
        createdById: schedule.assignedToId || 'system', // Use assigned user or system
        assignedToId: schedule.assignedToId,
        dueDate: schedule.nextDueDate,
      }
    });

    // Create a maintenance task record
    const task = await prisma.maintenanceTask.create({
      data: {
        scheduleId: schedule.id,
        workOrderId: workOrder.id,
      }
    });

    // Update the schedule's next due date based on frequency
    const nextDueDate = calculateNextDueDate(schedule.nextDueDate, schedule.frequency);
    await prisma.maintenanceSchedule.update({
      where: { id },
      data: { nextDueDate }
    });

    res.status(201).json({ 
      data: { 
        workOrder,
        task,
        nextDueDate 
      } 
    });
  } catch (error) {
    console.error('Error running maintenance schedule:', error);
    res.status(500).json({ error: 'Failed to run maintenance schedule' });
  }
});

// DELETE /api/v1/maintenance/schedules/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.maintenanceSchedule.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting maintenance schedule:', error);
    res.status(500).json({ error: 'Failed to delete maintenance schedule' });
  }
});

// Helper function to calculate next due date
function calculateNextDueDate(currentDate: Date, frequency: string): Date {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'DAILY':
      date.setDate(date.getDate() + 1);
      break;
    case 'WEEKLY':
      date.setDate(date.getDate() + 7);
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'YEARLY':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date;
}

export default router;
