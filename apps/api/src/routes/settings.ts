import express from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const updateSystemSettingsSchema = z.object({
  siteName: z.string().min(1).optional(),
  siteDescription: z.string().optional(),
  maintenanceMode: z.boolean().optional(),
  allowRegistration: z.boolean().optional(),
  defaultSLAHours: z.number().min(1).optional(),
  maxFileSize: z.number().min(1).optional(),
  allowedFileTypes: z.array(z.string()).optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  autoAssignWorkOrders: z.boolean().optional(),
  requireApprovalForHighPriority: z.boolean().optional(),
  enablePredictiveMaintenance: z.boolean().optional(),
  enableIoTIntegration: z.boolean().optional(),
  enableBlockchainAudit: z.boolean().optional(),
  enableARMaintenance: z.boolean().optional(),
  enableEnergyManagement: z.boolean().optional(),
  enableVendorManagement: z.boolean().optional(),
});

// GET /api/v1/settings - Get system settings (Admin only)
router.get('/', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    // For now, return default settings. In a real app, these would be stored in a settings table
    const settings = {
      siteName: 'COSTAATT CMMS',
      siteDescription: 'Computerized Maintenance Management System for COSTAATT',
      maintenanceMode: false,
      allowRegistration: false,
      defaultSLAHours: 24,
      maxFileSize: 10485760, // 10MB
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      autoAssignWorkOrders: true,
      requireApprovalForHighPriority: true,
      enablePredictiveMaintenance: true,
      enableIoTIntegration: true,
      enableBlockchainAudit: true,
      enableARMaintenance: true,
      enableEnergyManagement: true,
      enableVendorManagement: true,
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
    };

    res.json({ data: settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PATCH /api/v1/settings - Update system settings (Admin only)
router.patch('/', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const validatedData = updateSystemSettingsSchema.parse(req.body);
    
    // In a real app, you would update a settings table in the database
    // For now, we'll just return the updated settings
    const updatedSettings = {
      ...validatedData,
      lastUpdated: new Date().toISOString(),
    };

    res.json({ data: updatedSettings });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// GET /api/v1/settings/health - Get system health status (Admin only)
router.get('/health', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const [
      dbStatus,
      totalWorkOrders,
      activeUsers,
      systemUptime,
    ] = await Promise.all([
      // Test database connection
      prisma.$queryRaw`SELECT 1 as test`.then(() => 'healthy').catch(() => 'unhealthy'),
      prisma.workOrder.count(),
      prisma.user.count({ where: { isActive: true } }),
      process.uptime(),
    ]);

    const health = {
      status: dbStatus === 'healthy' ? 'healthy' : 'unhealthy',
      database: dbStatus,
      workOrders: totalWorkOrders,
      activeUsers,
      uptime: Math.floor(systemUptime),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };

    res.json({ data: health });
  } catch (error) {
    console.error('Get health status error:', error);
    res.status(500).json({ 
      data: {
        status: 'unhealthy',
        error: 'Failed to check system health',
        timestamp: new Date().toISOString(),
      }
    });
  }
});

// GET /api/v1/settings/backup - Get backup information (Admin only)
router.get('/backup', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    // In a real app, you would implement actual backup functionality
    const backupInfo = {
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
      nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      backupSize: '2.5 GB',
      backupLocation: '/backups/cmms/',
      autoBackup: true,
      retentionDays: 30,
    };

    res.json({ data: backupInfo });
  } catch (error) {
    console.error('Get backup info error:', error);
    res.status(500).json({ error: 'Failed to fetch backup information' });
  }
});

// POST /api/v1/settings/backup - Create manual backup (Admin only)
router.post('/backup', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    // In a real app, you would trigger an actual backup process
    const backupResult = {
      id: `backup_${Date.now()}`,
      status: 'initiated',
      startedAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    };

    res.status(202).json({ data: backupResult });
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// GET /api/v1/settings/logs - Get system logs (Admin only)
router.get('/logs', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { level = 'all', limit = 100 } = req.query;
    
    // In a real app, you would query actual log files or a logging database
    const mockLogs = [
      {
        id: '1',
        level: 'info',
        message: 'User admin@costaatt.edu.tt logged in successfully',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        source: 'auth',
      },
      {
        id: '2',
        level: 'warn',
        message: 'Work order #WO-001 is approaching SLA deadline',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        source: 'sla',
      },
      {
        id: '3',
        level: 'error',
        message: 'Failed to send email notification to user@example.com',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        source: 'notifications',
      },
    ];

    const filteredLogs = level === 'all' 
      ? mockLogs 
      : mockLogs.filter(log => log.level === level);

    res.json({ 
      data: filteredLogs.slice(0, Number(limit)),
      total: filteredLogs.length,
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

export default router;
