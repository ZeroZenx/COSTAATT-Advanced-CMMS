import express from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';
import { notificationService } from '../services/NotificationService';

const router = express.Router();

// GET /api/v1/notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user?.id;

    const where = {
      userId,
      ...(unreadOnly === 'true' && { readAt: null }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          workOrder: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/v1/notifications/unread-count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const count = await prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// PUT /api/v1/notifications/:id/read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PUT /api/v1/notifications/read-all
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// GET /api/v1/notifications/preferences
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;

    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: { userId },
      });
    }

    res.json({ data: preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

// PUT /api/v1/notifications/preferences
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { email, sms, push, webhook } = req.body;

    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId },
      update: { email, sms, push, webhook },
      create: { userId, email, sms, push, webhook },
    });

    res.json({ data: preferences });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// POST /api/v1/notifications/register-push-token
router.post('/register-push-token', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { token, platform } = req.body;

    // Deactivate existing tokens for this user
    await prisma.pushToken.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    // Create new token
    const pushToken = await prisma.pushToken.create({
      data: {
        userId,
        token,
        platform: platform || 'unknown',
      },
    });

    res.json({ data: pushToken });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ error: 'Failed to register push token' });
  }
});

// POST /api/v1/notifications/test
router.post('/test', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { userId, type = 'system_alert' } = req.body;

    const templates = notificationService.constructor.getTemplates();
    const template = templates[type as keyof typeof templates] || templates.system_alert;

    await notificationService.sendNotification({
      userId,
      type: type as any,
      priority: 'medium',
      channels: {
        email: true,
        sms: false,
        push: true,
        webhook: true,
      },
      template,
      data: { test: true },
    });

    res.json({ success: true, message: 'Test notification sent' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// GET /api/v1/notifications/templates
router.get('/templates', authenticate, async (req, res) => {
  try {
    const templates = notificationService.constructor.getTemplates();
    res.json({ data: templates });
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    res.status(500).json({ error: 'Failed to fetch notification templates' });
  }
});

export default router;
