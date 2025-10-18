import nodemailer, { Transporter } from 'nodemailer';
import { User, WorkOrder, MaintenanceSchedule, InventoryItem } from '@prisma/client';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailContext {
  user?: User;
  workOrder?: WorkOrder & { assignedTo?: User; createdBy?: User };
  maintenanceSchedule?: MaintenanceSchedule;
  inventoryItem?: InventoryItem;
  customData?: any;
}

export class EmailAutomationService {
  private transporter: Transporter | null = null;
  private isEnabled: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');

    if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.isEnabled = true;
      console.log('✅ Email automation enabled');
    } else {
      console.warn('⚠️ Email automation disabled - SMTP credentials not configured');
    }
  }

  // Email Templates
  private getTemplate(type: string, context: EmailContext): EmailTemplate {
    const baseUrl = process.env.APP_URL || 'http://localhost:5174';
    
    switch (type) {
      case 'work_order_created':
        return {
          subject: `New Work Order: ${context.workOrder?.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">COSTAATT CMMS</h1>
              </div>
              <div style="padding: 30px; background-color: #f9fafb;">
                <h2 style="color: #1f2937;">New Work Order Created</h2>
                <p style="color: #4b5563; font-size: 16px;">
                  A new work order has been created and assigned to you.
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h3 style="margin-top: 0; color: #1f2937;">${context.workOrder?.title}</h3>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Priority:</strong> <span style="color: ${context.workOrder?.priority === 'HIGH' ? '#ef4444' : context.workOrder?.priority === 'MEDIUM' ? '#f59e0b' : '#10b981'};">${context.workOrder?.priority}</span></p>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Status:</strong> ${context.workOrder?.status}</p>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Location:</strong> ${context.workOrder?.location || 'Not specified'}</p>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Description:</strong><br/>${context.workOrder?.description}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/work-orders/${context.workOrder?.id}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Work Order</a>
                </div>
              </div>
              <div style="background-color: #e5e7eb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
                <p>COSTAATT Computerized Maintenance Management System</p>
                <p>This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          `,
          text: `New Work Order: ${context.workOrder?.title}\n\nPriority: ${context.workOrder?.priority}\nStatus: ${context.workOrder?.status}\nLocation: ${context.workOrder?.location}\n\nDescription: ${context.workOrder?.description}\n\nView: ${baseUrl}/work-orders/${context.workOrder?.id}`,
        };

      case 'work_order_completed':
        return {
          subject: `Work Order Completed: ${context.workOrder?.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">✅ Work Order Completed</h1>
              </div>
              <div style="padding: 30px; background-color: #f9fafb;">
                <p style="color: #4b5563; font-size: 16px;">
                  Great news! The following work order has been completed.
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h3 style="margin-top: 0; color: #1f2937;">${context.workOrder?.title}</h3>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Completed by:</strong> ${context.workOrder?.assignedTo?.displayName}</p>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Location:</strong> ${context.workOrder?.location || 'Not specified'}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/work-orders/${context.workOrder?.id}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a>
                </div>
              </div>
              <div style="background-color: #e5e7eb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
                <p>COSTAATT CMMS</p>
              </div>
            </div>
          `,
          text: `Work Order Completed: ${context.workOrder?.title}\n\nCompleted by: ${context.workOrder?.assignedTo?.displayName}\nLocation: ${context.workOrder?.location}\n\nView: ${baseUrl}/work-orders/${context.workOrder?.id}`,
        };

      case 'maintenance_reminder':
        return {
          subject: `Maintenance Reminder: ${context.maintenanceSchedule?.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">🔔 Maintenance Reminder</h1>
              </div>
              <div style="padding: 30px; background-color: #f9fafb;">
                <p style="color: #4b5563; font-size: 16px;">
                  This is a reminder that preventive maintenance is due soon.
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h3 style="margin-top: 0; color: #1f2937;">${context.maintenanceSchedule?.title}</h3>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Next Due:</strong> ${context.maintenanceSchedule?.nextDueDate}</p>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Frequency:</strong> ${context.maintenanceSchedule?.frequency}</p>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Description:</strong><br/>${context.maintenanceSchedule?.description}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/maintenance" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Schedule</a>
                </div>
              </div>
              <div style="background-color: #e5e7eb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
                <p>COSTAATT CMMS</p>
              </div>
            </div>
          `,
          text: `Maintenance Reminder: ${context.maintenanceSchedule?.title}\n\nNext Due: ${context.maintenanceSchedule?.nextDueDate}\nFrequency: ${context.maintenanceSchedule?.frequency}\n\nView: ${baseUrl}/maintenance`,
        };

      case 'low_stock_alert':
        return {
          subject: `Low Stock Alert: ${context.inventoryItem?.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚠️ Low Stock Alert</h1>
              </div>
              <div style="padding: 30px; background-color: #f9fafb;">
                <p style="color: #4b5563; font-size: 16px;">
                  The following inventory item is running low on stock.
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h3 style="margin-top: 0; color: #1f2937;">${context.inventoryItem?.name}</h3>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Current Stock:</strong> <span style="color: #ef4444; font-weight: bold;">${context.inventoryItem?.quantity}</span></p>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Minimum Stock:</strong> ${context.inventoryItem?.minQuantity}</p>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>SKU:</strong> ${context.inventoryItem?.sku}</p>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Location:</strong> ${context.inventoryItem?.location}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/inventory" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reorder Now</a>
                </div>
              </div>
              <div style="background-color: #e5e7eb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
                <p>COSTAATT CMMS</p>
              </div>
            </div>
          `,
          text: `Low Stock Alert: ${context.inventoryItem?.name}\n\nCurrent Stock: ${context.inventoryItem?.quantity}\nMinimum Stock: ${context.inventoryItem?.minQuantity}\nSKU: ${context.inventoryItem?.sku}\n\nReorder: ${baseUrl}/inventory`,
        };

      case 'user_welcome':
        return {
          subject: 'Welcome to COSTAATT CMMS',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Welcome to COSTAATT CMMS</h1>
              </div>
              <div style="padding: 30px; background-color: #f9fafb;">
                <p style="color: #4b5563; font-size: 16px;">
                  Hello ${context.user?.displayName},
                </p>
                <p style="color: #4b5563; font-size: 16px;">
                  Welcome to the COSTAATT Computerized Maintenance Management System! Your account has been created successfully.
                </p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <h3 style="margin-top: 0; color: #1f2937;">Your Account Details</h3>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Email:</strong> ${context.user?.email}</p>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Role:</strong> ${context.user?.role}</p>
                  <p style="color: #6b7280; margin: 10px 0;"><strong>Department:</strong> ${context.user?.department}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/login" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Login Now</a>
                </div>
              </div>
              <div style="background-color: #e5e7eb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
                <p>COSTAATT CMMS</p>
              </div>
            </div>
          `,
          text: `Welcome to COSTAATT CMMS\n\nHello ${context.user?.displayName},\n\nYour account has been created successfully.\n\nEmail: ${context.user?.email}\nRole: ${context.user?.role}\nDepartment: ${context.user?.department}\n\nLogin: ${baseUrl}/login`,
        };

      default:
        return {
          subject: 'COSTAATT CMMS Notification',
          html: '<p>You have a new notification from COSTAATT CMMS.</p>',
          text: 'You have a new notification from COSTAATT CMMS.',
        };
    }
  }

  // Send email
  async sendEmail(to: string | string[], type: string, context: EmailContext): Promise<boolean> {
    if (!this.isEnabled || !this.transporter) {
      console.warn('Email not sent - service disabled');
      return false;
    }

    try {
      const template = this.getTemplate(type, context);
      const recipients = Array.isArray(to) ? to.join(', ') : to;

      await this.transporter.sendMail({
        from: `"COSTAATT CMMS" <${process.env.SMTP_USER}>`,
        to: recipients,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });

      console.log(`✅ Email sent to ${recipients}: ${template.subject}`);
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  // Automated workflows
  async notifyWorkOrderCreated(workOrder: WorkOrder & { assignedTo?: User; createdBy?: User }) {
    if (workOrder.assignedTo?.email) {
      await this.sendEmail(workOrder.assignedTo.email, 'work_order_created', { workOrder });
    }
  }

  async notifyWorkOrderCompleted(workOrder: WorkOrder & { assignedTo?: User; createdBy?: User }) {
    if (workOrder.createdBy?.email) {
      await this.sendEmail(workOrder.createdBy.email, 'work_order_completed', { workOrder });
    }
  }

  async notifyMaintenanceDue(maintenanceSchedule: MaintenanceSchedule, users: User[]) {
    const emails = users.map(u => u.email).filter(Boolean);
    if (emails.length > 0) {
      await this.sendEmail(emails, 'maintenance_reminder', { maintenanceSchedule });
    }
  }

  async notifyLowStock(inventoryItem: InventoryItem, users: User[]) {
    const emails = users.map(u => u.email).filter(Boolean);
    if (emails.length > 0) {
      await this.sendEmail(emails, 'low_stock_alert', { inventoryItem });
    }
  }

  async sendWelcomeEmail(user: User) {
    await this.sendEmail(user.email, 'user_welcome', { user });
  }
}

export const emailAutomationService = new EmailAutomationService();
