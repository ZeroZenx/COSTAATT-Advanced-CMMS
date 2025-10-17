import express from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';

const router = express.Router();

// GET /api/v1/analytics/dashboard
router.get('/dashboard', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get work order statistics
    const totalWorkOrders = await prisma.workOrder.count();
    const openWorkOrders = await prisma.workOrder.count({ where: { status: 'OPEN' } });
    const inProgressWorkOrders = await prisma.workOrder.count({ where: { status: 'IN_PROGRESS' } });
    const completedWorkOrders = await prisma.workOrder.count({ where: { status: 'COMPLETED' } });
    const cancelledWorkOrders = await prisma.workOrder.count({ where: { status: 'CANCELLED' } });

    // Get work orders by priority
    const workOrdersByPriority = await prisma.workOrder.groupBy({
      by: ['priority'],
      _count: { priority: true },
    });

    // Get work orders by category
    const workOrdersByCategory = await prisma.workOrder.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    // Get work orders created in the specified period
    const recentWorkOrders = await prisma.workOrder.count({
      where: {
        createdAt: { gte: startDate }
      }
    });

    // Get completed work orders in the specified period
    const recentCompleted = await prisma.workOrder.count({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: startDate }
      }
    });

    // Get average completion time
    const completedWithTimes = await prisma.workOrder.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: { not: null }
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    });

    const avgCompletionTime = completedWithTimes.length > 0 
      ? completedWithTimes.reduce((sum, wo) => {
          const duration = wo.completedAt!.getTime() - wo.createdAt.getTime();
          return sum + duration;
        }, 0) / completedWithTimes.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Get SLA statistics
    const totalSLAEvents = await prisma.sLAEvent.count();
    const breachedSLAEvents = await prisma.sLAEvent.count({ where: { breached: true } });
    const resolvedSLAEvents = await prisma.sLAEvent.count({ where: { resolvedAt: { not: null } } });

    // Get maintenance statistics
    const totalMaintenanceSchedules = await prisma.maintenanceSchedule.count();
    const activeMaintenanceSchedules = await prisma.maintenanceSchedule.count({ where: { status: 'ACTIVE' } });
    const completedMaintenanceTasks = await prisma.maintenanceTask.count({ where: { performedAt: { not: null } } });

    // Get inventory statistics
    const totalInventoryItems = await prisma.inventoryItem.count();
    const lowStockItems = await prisma.inventoryItem.count({
      where: {
        quantity: { lte: prisma.inventoryItem.fields.reorderLevel }
      }
    });

    // Get user statistics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    res.json({
      data: {
        workOrders: {
          total: totalWorkOrders,
          open: openWorkOrders,
          inProgress: inProgressWorkOrders,
          completed: completedWorkOrders,
          cancelled: cancelledWorkOrders,
          byPriority: workOrdersByPriority,
          byCategory: workOrdersByCategory,
          recent: recentWorkOrders,
          recentCompleted: recentCompleted,
          avgCompletionTimeHours: Math.round(avgCompletionTime * 100) / 100
        },
        sla: {
          total: totalSLAEvents,
          breached: breachedSLAEvents,
          resolved: resolvedSLAEvents,
          breachRate: totalSLAEvents > 0 ? Math.round((breachedSLAEvents / totalSLAEvents) * 100 * 100) / 100 : 0
        },
        maintenance: {
          totalSchedules: totalMaintenanceSchedules,
          activeSchedules: activeMaintenanceSchedules,
          completedTasks: completedMaintenanceTasks
        },
        inventory: {
          totalItems: totalInventoryItems,
          lowStockItems: lowStockItems,
          lowStockRate: totalInventoryItems > 0 ? Math.round((lowStockItems / totalInventoryItems) * 100 * 100) / 100 : 0
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          byRole: usersByRole
        }
      },
      period: `${days} days`,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/v1/analytics/work-orders/trends
router.get('/work-orders/trends', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily work order creation trends
    const dailyTrends = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
      FROM work_orders 
      WHERE createdAt >= ${startDate}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `;

    // Get monthly trends for the last 12 months
    const monthlyTrends = await prisma.$queryRaw`
      SELECT 
        YEAR(createdAt) as year,
        MONTH(createdAt) as month,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
      FROM work_orders 
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY YEAR(createdAt), MONTH(createdAt)
      ORDER BY year ASC, month ASC
    `;

    res.json({
      data: {
        daily: dailyTrends,
        monthly: monthlyTrends
      },
      period: `${days} days`,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching work order trends:', error);
    res.status(500).json({ error: 'Failed to fetch work order trends' });
  }
});

// GET /api/v1/analytics/performance
router.get('/performance', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get top performing technicians
    const topTechnicians = await prisma.user.findMany({
      where: {
        role: 'TECHNICIAN',
        assignedWorkOrders: {
          some: {
            status: 'COMPLETED',
            completedAt: { gte: startDate }
          }
        }
      },
      include: {
        _count: {
          select: {
            assignedWorkOrders: {
              where: {
                status: 'COMPLETED',
                completedAt: { gte: startDate }
              }
            }
          }
        }
      },
      orderBy: {
        assignedWorkOrders: {
          _count: 'desc'
        }
      },
      take: 10
    });

    // Get most common issues
    const commonIssues = await prisma.workOrder.groupBy({
      by: ['category'],
      _count: { category: true },
      where: {
        createdAt: { gte: startDate }
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      },
      take: 10
    });

    // Get locations with most issues
    const problemLocations = await prisma.workOrder.groupBy({
      by: ['location'],
      _count: { location: true },
      where: {
        createdAt: { gte: startDate }
      },
      orderBy: {
        _count: {
          location: 'desc'
        }
      },
      take: 10
    });

    res.json({
      data: {
        topTechnicians: topTechnicians.map(tech => ({
          id: tech.id,
          name: tech.displayName,
          email: tech.email,
          completedWorkOrders: tech._count.assignedWorkOrders
        })),
        commonIssues: commonIssues,
        problemLocations: problemLocations
      },
      period: `${days} days`,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({ error: 'Failed to fetch performance analytics' });
  }
});

export default router;
