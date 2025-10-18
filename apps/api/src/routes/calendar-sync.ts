import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { calendarSyncService } from '../services/CalendarSyncService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = Router();

// Get calendar sync status
router.get('/status', authenticate, async (req, res) => {
  try {
    res.json({
      outlook: {
        enabled: calendarSyncService.isAvailable('outlook'),
        configured: !!(process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_ID !== 'your-client-id-here'),
      },
      google: {
        enabled: calendarSyncService.isAvailable('google'),
        configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      },
    });
  } catch (error) {
    console.error('Calendar status error:', error);
    res.status(500).json({ error: 'Failed to get calendar status' });
  }
});

// Sync maintenance schedule to calendar
router.post('/maintenance/:id/sync', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { provider, accessToken } = req.body;

    if (!provider || !accessToken) {
      return res.status(400).json({ error: 'Provider and access token required' });
    }

    const schedule = await prisma.maintenanceSchedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Maintenance schedule not found' });
    }

    let result;
    if (provider === 'outlook') {
      result = await calendarSyncService.syncMaintenanceToOutlook(schedule, {
        type: 'outlook',
        accessToken,
      });
    } else if (provider === 'google') {
      result = await calendarSyncService.syncMaintenanceToGoogle(schedule, {
        type: 'google',
        accessToken,
      });
    } else {
      return res.status(400).json({ error: 'Invalid provider. Use outlook or google' });
    }

    if (result.success) {
      res.json({
        success: true,
        message: 'Maintenance schedule synced to calendar',
        eventId: result.eventId,
      });
    } else {
      res.status(500).json({ error: result.error || 'Failed to sync to calendar' });
    }
  } catch (error) {
    console.error('Sync maintenance error:', error);
    res.status(500).json({ error: 'Failed to sync maintenance schedule' });
  }
});

// Sync work order to calendar
router.post('/work-order/:id/sync', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { provider, accessToken } = req.body;

    if (!provider || !accessToken) {
      return res.status(400).json({ error: 'Provider and access token required' });
    }

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Work order not found' });
    }

    let result;
    if (provider === 'outlook') {
      result = await calendarSyncService.syncWorkOrderToOutlook(workOrder, {
        type: 'outlook',
        accessToken,
      });
    } else if (provider === 'google') {
      result = await calendarSyncService.syncWorkOrderToGoogle(workOrder, {
        type: 'google',
        accessToken,
      });
    } else {
      return res.status(400).json({ error: 'Invalid provider. Use outlook or google' });
    }

    if (result.success) {
      res.json({
        success: true,
        message: 'Work order synced to calendar',
        eventId: result.eventId,
      });
    } else {
      res.status(500).json({ error: result.error || 'Failed to sync to calendar' });
    }
  } catch (error) {
    console.error('Sync work order error:', error);
    res.status(500).json({ error: 'Failed to sync work order' });
  }
});

// Get upcoming calendar events
router.post('/events', authenticate, async (req, res) => {
  try {
    const { provider, accessToken, days = 7 } = req.body;

    if (!provider || !accessToken) {
      return res.status(400).json({ error: 'Provider and access token required' });
    }

    const result = await calendarSyncService.getUpcomingEvents(
      { type: provider, accessToken },
      days
    );

    if (result.success) {
      res.json({ events: result.events });
    } else {
      res.status(500).json({ error: result.error || 'Failed to fetch events' });
    }
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

export default router;
