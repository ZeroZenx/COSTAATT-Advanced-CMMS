import * as nodemailer from 'nodemailer';
import twilio from 'twilio';
import { prisma } from '../utils/prisma';
import WebSocket from 'ws';

interface NotificationChannel {
  email: boolean;
  sms: boolean;
  push: boolean;
  webhook: boolean;
}

interface NotificationTemplate {
  subject: string;
  body: string;
  html?: string;
}

interface NotificationData {
  userId: string;
  workOrderId?: string;
  type: 'work_order_created' | 'work_order_assigned' | 'work_order_updated' | 'work_order_completed' | 'sla_breach' | 'sla_escalation' | 'maintenance_due' | 'inventory_low' | 'system_alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: NotificationChannel;
  template: NotificationTemplate;
  data: any;
}

class NotificationService {
  private emailTransporter: nodemailer.Transporter;
  private twilioClient: twilio.Twilio;
  private webSocketConnections: Map<string, WebSocket> = new Map();

  constructor() {
    // Initialize email transporter (optional)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.log('⚠️ SMTP credentials not found - Email notifications disabled');
      this.emailTransporter = null as any;
    }

    // Initialize Twilio client (optional)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } else {
      console.log('⚠️ Twilio credentials not found - SMS notifications disabled');
      this.twilioClient = null as any;
    }
  }

  // Register WebSocket connection for real-time notifications
  registerWebSocket(userId: string, ws: WebSocket) {
    this.webSocketConnections.set(userId, ws);
    
    ws.on('close', () => {
      this.webSocketConnections.delete(userId);
    });
  }

  // Send notification through multiple channels
  async sendNotification(notification: NotificationData): Promise<void> {
    try {
      const user = await this.getUserWithPreferences(notification.userId);
      if (!user) return;

      const channels = this.determineChannels(notification, user);
      const promises: Promise<void>[] = [];

      // Email notification
      if (channels.email && user.email) {
        promises.push(this.sendEmailNotification(user.email, notification));
      }

      // SMS notification
      if (channels.sms && user.phone) {
        promises.push(this.sendSMSNotification(user.phone, notification));
      }

      // Push notification
      if (channels.push) {
        promises.push(this.sendPushNotification(user.id, notification));
      }

      // WebSocket real-time notification
      if (channels.webhook) {
        promises.push(this.sendWebSocketNotification(user.id, notification));
      }

      // Store notification in database
      promises.push(this.storeNotification(notification));

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Send bulk notifications
  async sendBulkNotification(userIds: string[], notification: Omit<NotificationData, 'userId'>): Promise<void> {
    const promises = userIds.map(userId => 
      this.sendNotification({ ...notification, userId })
    );
    await Promise.allSettled(promises);
  }

  // Send email notification
  private async sendEmailNotification(email: string, notification: NotificationData): Promise<void> {
    try {
      if (!this.emailTransporter) {
        console.log('Email not sent - SMTP not configured');
        return;
      }
      
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@costaatt.edu.tt',
        to: email,
        subject: notification.template.subject,
        text: notification.template.body,
        html: notification.template.html || this.generateHTMLTemplate(notification),
      };

      await this.emailTransporter.sendMail(mailOptions);
      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  // Send SMS notification
  private async sendSMSNotification(phone: string, notification: NotificationData): Promise<void> {
    try {
      if (!this.twilioClient) {
        console.log('SMS not sent - Twilio not configured');
        return;
      }
      
      await this.twilioClient.messages.create({
        body: `${notification.template.subject}\n\n${notification.template.body}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      console.log(`SMS sent to ${phone}`);
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  }

  // Send push notification
  private async sendPushNotification(userId: string, notification: NotificationData): Promise<void> {
    try {
      // Get user's push tokens
      const pushTokens = await this.getUserPushTokens(userId);
      
      for (const token of pushTokens) {
        // Send push notification using Expo or FCM
        await this.sendExpoPushNotification(token, notification);
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  // Send WebSocket notification
  private async sendWebSocketNotification(userId: string, notification: NotificationData): Promise<void> {
    const ws = this.webSocketConnections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'notification',
        data: notification,
        timestamp: new Date().toISOString(),
      }));
    }
  }

  // Store notification in database
  private async storeNotification(notification: NotificationData): Promise<void> {
    await prisma.notification.create({
      data: {
        userId: notification.userId,
        workOrderId: notification.workOrderId,
        type: notification.type,
        priority: notification.priority,
        subject: notification.template.subject,
        body: notification.template.body,
        data: notification.data,
        sentAt: new Date(),
      },
    });
  }

  // Get user with notification preferences
  private async getUserWithPreferences(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        notificationPreferences: true,
      },
    });
  }

  // Determine which channels to use based on user preferences and notification priority
  private determineChannels(notification: NotificationData, user: any): NotificationChannel {
    const preferences = user.notificationPreferences || {};
    
    return {
      email: preferences.email !== false && ['medium', 'high', 'urgent'].includes(notification.priority),
      sms: preferences.sms === true && ['high', 'urgent'].includes(notification.priority),
      push: preferences.push !== false,
      webhook: preferences.webhook !== false,
    };
  }

  // Get user's push notification tokens
  private async getUserPushTokens(userId: string): Promise<string[]> {
    const tokens = await prisma.pushToken.findMany({
      where: { userId, isActive: true },
      select: { token: true },
    });
    return tokens.map(t => t.token);
  }

  // Send Expo push notification
  private async sendExpoPushNotification(token: string, notification: NotificationData): Promise<void> {
    const message = {
      to: token,
      sound: 'default',
      title: notification.template.subject,
      body: notification.template.body,
      data: notification.data,
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Expo push notification failed: ${response.status}`);
    }
  }

  // Generate HTML template for email
  private generateHTMLTemplate(notification: NotificationData): string {
    const priorityColor = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#dc2626',
    }[notification.priority];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${priorityColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .priority { display: inline-block; padding: 4px 8px; border-radius: 4px; background: ${priorityColor}; color: white; font-size: 12px; text-transform: uppercase; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${notification.template.subject}</h1>
              <span class="priority">${notification.priority}</span>
            </div>
            <div class="content">
              <p>${notification.template.body}</p>
              ${notification.workOrderId ? `<p><a href="${process.env.FRONTEND_URL}/work-orders/${notification.workOrderId}">View Work Order</a></p>` : ''}
            </div>
            <div class="footer">
              <p>This is an automated notification from COSTAATT CMMS.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Notification templates
  static getTemplates() {
    return {
      work_order_created: {
        subject: 'New Work Order Created',
        body: 'A new work order has been created and requires your attention.',
      },
      work_order_assigned: {
        subject: 'Work Order Assigned to You',
        body: 'A work order has been assigned to you. Please review and begin work.',
      },
      work_order_updated: {
        subject: 'Work Order Updated',
        body: 'A work order has been updated with new information.',
      },
      work_order_completed: {
        subject: 'Work Order Completed',
        body: 'A work order has been marked as completed.',
      },
      sla_breach: {
        subject: 'SLA Breach Alert',
        body: 'A work order has exceeded its SLA target time.',
      },
      sla_escalation: {
        subject: 'SLA Escalation Required',
        body: 'A work order requires immediate escalation due to SLA breach.',
      },
      maintenance_due: {
        subject: 'Maintenance Due',
        body: 'Scheduled maintenance is due for completion.',
      },
      inventory_low: {
        subject: 'Low Inventory Alert',
        body: 'Inventory levels are below reorder threshold.',
      },
      system_alert: {
        subject: 'System Alert',
        body: 'A system alert has been triggered.',
      },
    };
  }
}

export const notificationService = new NotificationService();
