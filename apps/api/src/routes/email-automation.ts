import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { emailAutomationService } from '../services/EmailAutomationService';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const router = Router();

// Test email sending
router.post('/test', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { email, type } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    
    const success = await emailAutomationService.sendEmail(
      email || user!.email,
      type || 'user_welcome',
      { user: user! }
    );

    res.json({ success, message: success ? 'Test email sent successfully' : 'Failed to send email' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// Get email automation status
router.get('/status', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const isEnabled = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
    
    res.json({
      enabled: isEnabled,
      config: {
        smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: process.env.SMTP_PORT || '587',
        smtpUser: process.env.SMTP_USER ? '***configured***' : 'not configured',
      },
    });
  } catch (error) {
    console.error('Email status error:', error);
    res.status(500).json({ error: 'Failed to get email status' });
  }
});

// Send custom email
router.post('/send', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, message' });
    }

    const success = await emailAutomationService.sendEmail(
      to,
      'custom',
      {
        customData: {
          subject,
          message,
        },
      }
    );

    res.json({ success, message: success ? 'Email sent successfully' : 'Failed to send email' });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;
