import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';

interface EmailConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  fromEmail: string;
}

interface EmailMessage {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: Array<{
    name: string;
    content: string; // base64 encoded
    contentType: string;
  }>;
}

class GraphAuthProvider implements AuthenticationProvider {
  private credential: ClientSecretCredential;

  constructor(clientId: string, clientSecret: string, tenantId: string) {
    this.credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  }

  async getAccessToken(): Promise<string> {
    const tokenResponse = await this.credential.getToken('https://graph.microsoft.com/.default');
    return tokenResponse?.token || '';
  }
}

export class EmailService {
  private graphClient: Client;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    
    const authProvider = new GraphAuthProvider(
      config.clientId,
      config.clientSecret,
      config.tenantId
    );
    
    this.graphClient = Client.initWithMiddleware({ authProvider });
  }

  async sendEmail(message: EmailMessage): Promise<boolean> {
    try {
      const recipients = Array.isArray(message.to) ? message.to : [message.to];
      const ccRecipients = message.cc ? (Array.isArray(message.cc) ? message.cc : [message.cc]) : [];
      const bccRecipients = message.bcc ? (Array.isArray(message.bcc) ? message.bcc : [message.bcc]) : [];

      const emailMessage = {
        message: {
          subject: message.subject,
          body: {
            contentType: message.isHtml ? 'HTML' : 'Text',
            content: message.body,
          },
          toRecipients: recipients.map(email => ({
            emailAddress: {
              address: email,
            },
          })),
          ccRecipients: ccRecipients.map(email => ({
            emailAddress: {
              address: email,
            },
          })),
          bccRecipients: bccRecipients.map(email => ({
            emailAddress: {
              address: email,
            },
          })),
          attachments: message.attachments?.map(attachment => ({
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: attachment.name,
            contentType: attachment.contentType,
            contentBytes: attachment.content,
          })) || [],
        },
        saveToSentItems: true,
      };

      await this.graphClient.api('/me/sendMail').post(emailMessage);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendWorkOrderCreatedEmail(workOrder: any, recipients: string[]): Promise<boolean> {
    const subject = `New Work Order Created - ${workOrder.workOrderNumber || workOrder.id}`;
    const body = this.generateWorkOrderCreatedEmailBody(workOrder);
    
    return this.sendEmail({
      to: recipients,
      subject,
      body,
      isHtml: true,
    });
  }

  async sendWorkOrderUpdatedEmail(workOrder: any, recipients: string[], changes: string[]): Promise<boolean> {
    const subject = `Work Order Updated - ${workOrder.workOrderNumber || workOrder.id}`;
    const body = this.generateWorkOrderUpdatedEmailBody(workOrder, changes);
    
    return this.sendEmail({
      to: recipients,
      subject,
      body,
      isHtml: true,
    });
  }

  async sendWorkOrderAssignedEmail(workOrder: any, assignee: any, recipients: string[]): Promise<boolean> {
    const subject = `Work Order Assigned - ${workOrder.workOrderNumber || workOrder.id}`;
    const body = this.generateWorkOrderAssignedEmailBody(workOrder, assignee);
    
    return this.sendEmail({
      to: recipients,
      subject,
      body,
      isHtml: true,
    });
  }

  async sendWorkOrderCompletedEmail(workOrder: any, recipients: string[]): Promise<boolean> {
    const subject = `Work Order Completed - ${workOrder.workOrderNumber || workOrder.id}`;
    const body = this.generateWorkOrderCompletedEmailBody(workOrder);
    
    return this.sendEmail({
      to: recipients,
      subject,
      body,
      isHtml: true,
    });
  }

  async sendSlaWarningEmail(workOrder: any, phase: any, recipients: string[]): Promise<boolean> {
    const subject = `SLA Warning - Work Order ${workOrder.workOrderNumber || workOrder.id}`;
    const body = this.generateSlaWarningEmailBody(workOrder, phase);
    
    return this.sendEmail({
      to: recipients,
      subject,
      body,
      isHtml: true,
    });
  }

  async sendSlaBreachEmail(workOrder: any, phase: any, recipients: string[]): Promise<boolean> {
    const subject = `SLA Breach - Work Order ${workOrder.workOrderNumber || workOrder.id}`;
    const body = this.generateSlaBreachEmailBody(workOrder, phase);
    
    return this.sendEmail({
      to: recipients,
      subject,
      body,
      isHtml: true,
    });
  }

  async sendContractorAssignedEmail(workOrder: any, contractor: any, recipients: string[]): Promise<boolean> {
    const subject = `Contractor Assignment - Work Order ${workOrder.workOrderNumber || workOrder.id}`;
    const body = this.generateContractorAssignedEmailBody(workOrder, contractor);
    
    return this.sendEmail({
      to: recipients,
      subject,
      body,
      isHtml: true,
    });
  }

  async sendPerformanceReviewEmail(contractor: any, performance: any, recipients: string[]): Promise<boolean> {
    const subject = `Performance Review - ${contractor.name}`;
    const body = this.generatePerformanceReviewEmailBody(contractor, performance);
    
    return this.sendEmail({
      to: recipients,
      subject,
      body,
      isHtml: true,
    });
  }

  private generateWorkOrderCreatedEmailBody(workOrder: any): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">New Work Order Created</h2>
            <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Work Order Details</h3>
              <p><strong>Work Order Number:</strong> ${workOrder.workOrderNumber || workOrder.id}</p>
              <p><strong>Title:</strong> ${workOrder.title}</p>
              <p><strong>Description:</strong> ${workOrder.description || 'N/A'}</p>
              <p><strong>Priority:</strong> ${workOrder.priority || 'Normal'}</p>
              <p><strong>Status:</strong> ${workOrder.status || 'Open'}</p>
              <p><strong>Location:</strong> ${workOrder.location || 'N/A'}</p>
              <p><strong>Created By:</strong> ${workOrder.createdBy?.displayName || 'System'}</p>
              <p><strong>Created Date:</strong> ${new Date(workOrder.createdAt).toLocaleString()}</p>
            </div>
            <p>Please review and take appropriate action.</p>
            <p style="color: #666; font-size: 12px;">
              This is an automated message from the COSTAATT CMMS system.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateWorkOrderUpdatedEmailBody(workOrder: any, changes: string[]): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Work Order Updated</h2>
            <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Work Order Details</h3>
              <p><strong>Work Order Number:</strong> ${workOrder.workOrderNumber || workOrder.id}</p>
              <p><strong>Title:</strong> ${workOrder.title}</p>
              <p><strong>Status:</strong> ${workOrder.status || 'Open'}</p>
              <p><strong>Updated Date:</strong> ${new Date(workOrder.updatedAt).toLocaleString()}</p>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Changes Made</h3>
              <ul>
                ${changes.map(change => `<li>${change}</li>`).join('')}
              </ul>
            </div>
            <p>Please review the updated information.</p>
            <p style="color: #666; font-size: 12px;">
              This is an automated message from the COSTAATT CMMS system.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateWorkOrderAssignedEmailBody(workOrder: any, assignee: any): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Work Order Assigned</h2>
            <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Work Order Details</h3>
              <p><strong>Work Order Number:</strong> ${workOrder.workOrderNumber || workOrder.id}</p>
              <p><strong>Title:</strong> ${workOrder.title}</p>
              <p><strong>Description:</strong> ${workOrder.description || 'N/A'}</p>
              <p><strong>Priority:</strong> ${workOrder.priority || 'Normal'}</p>
              <p><strong>Location:</strong> ${workOrder.location || 'N/A'}</p>
            </div>
            <div style="background: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Assignment Details</h3>
              <p><strong>Assigned To:</strong> ${assignee.displayName || assignee.name}</p>
              <p><strong>Email:</strong> ${assignee.email}</p>
              <p><strong>Assigned Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>Please review and begin work on this assignment.</p>
            <p style="color: #666; font-size: 12px;">
              This is an automated message from the COSTAATT CMMS system.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateWorkOrderCompletedEmailBody(workOrder: any): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669;">Work Order Completed</h2>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Work Order Details</h3>
              <p><strong>Work Order Number:</strong> ${workOrder.workOrderNumber || workOrder.id}</p>
              <p><strong>Title:</strong> ${workOrder.title}</p>
              <p><strong>Status:</strong> ${workOrder.status || 'Completed'}</p>
              <p><strong>Completed Date:</strong> ${new Date(workOrder.completedAt || workOrder.updatedAt).toLocaleString()}</p>
            </div>
            <p>The work order has been completed successfully.</p>
            <p style="color: #666; font-size: 12px;">
              This is an automated message from the COSTAATT CMMS system.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateSlaWarningEmailBody(workOrder: any, phase: any): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d97706;">SLA Warning</h2>
            <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Work Order Details</h3>
              <p><strong>Work Order Number:</strong> ${workOrder.workOrderNumber || workOrder.id}</p>
              <p><strong>Title:</strong> ${workOrder.title}</p>
              <p><strong>Current Phase:</strong> ${phase.name}</p>
              <p><strong>Warning Time:</strong> ${phase.warningHours || 'N/A'} hours</p>
            </div>
            <p style="color: #d97706; font-weight: bold;">
              ⚠️ This work order is approaching its SLA deadline. Please take immediate action.
            </p>
            <p style="color: #666; font-size: 12px;">
              This is an automated message from the COSTAATT CMMS system.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateSlaBreachEmailBody(workOrder: any, phase: any): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">SLA Breach Alert</h2>
            <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Work Order Details</h3>
              <p><strong>Work Order Number:</strong> ${workOrder.workOrderNumber || workOrder.id}</p>
              <p><strong>Title:</strong> ${workOrder.title}</p>
              <p><strong>Current Phase:</strong> ${phase.name}</p>
              <p><strong>Target Time:</strong> ${phase.targetHours || 'N/A'} hours</p>
            </div>
            <p style="color: #dc2626; font-weight: bold;">
              🚨 SLA BREACH: This work order has exceeded its SLA deadline. Immediate attention required.
            </p>
            <p style="color: #666; font-size: 12px;">
              This is an automated message from the COSTAATT CMMS system.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateContractorAssignedEmailBody(workOrder: any, contractor: any): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Contractor Assignment</h2>
            <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Work Order Details</h3>
              <p><strong>Work Order Number:</strong> ${workOrder.workOrderNumber || workOrder.id}</p>
              <p><strong>Title:</strong> ${workOrder.title}</p>
              <p><strong>Description:</strong> ${workOrder.description || 'N/A'}</p>
              <p><strong>Priority:</strong> ${workOrder.priority || 'Normal'}</p>
            </div>
            <div style="background: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Contractor Details</h3>
              <p><strong>Contractor:</strong> ${contractor.name}</p>
              <p><strong>Contact Person:</strong> ${contractor.contactPerson || 'N/A'}</p>
              <p><strong>Email:</strong> ${contractor.email}</p>
              <p><strong>Phone:</strong> ${contractor.phone || 'N/A'}</p>
            </div>
            <p>Please coordinate with the assigned contractor to begin work.</p>
            <p style="color: #666; font-size: 12px;">
              This is an automated message from the COSTAATT CMMS system.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generatePerformanceReviewEmailBody(contractor: any, performance: any): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Performance Review</h2>
            <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Contractor Details</h3>
              <p><strong>Contractor:</strong> ${contractor.name}</p>
              <p><strong>Email:</strong> ${contractor.email}</p>
            </div>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Performance Metrics</h3>
              <p><strong>Overall Rating:</strong> ${performance.rating}/5 ⭐</p>
              <p><strong>Quality Score:</strong> ${performance.quality || 'N/A'}/5</p>
              <p><strong>Response Time:</strong> ${performance.responseTime || 'N/A'} hours</p>
              <p><strong>Cost Efficiency:</strong> $${performance.cost || 'N/A'}</p>
              <p><strong>Review Date:</strong> ${new Date(performance.createdAt).toLocaleString()}</p>
              ${performance.notes ? `<p><strong>Notes:</strong> ${performance.notes}</p>` : ''}
            </div>
            <p>Please review the contractor's performance metrics.</p>
            <p style="color: #666; font-size: 12px;">
              This is an automated message from the COSTAATT CMMS system.
            </p>
          </div>
        </body>
      </html>
    `;
  }
}

// Export singleton instance
export const emailService = new EmailService({
  clientId: process.env.MS_GRAPH_CLIENT_ID || '',
  clientSecret: process.env.MS_GRAPH_CLIENT_SECRET || '',
  tenantId: process.env.MS_GRAPH_TENANT_ID || '',
  fromEmail: process.env.FROM_EMAIL || 'CSD@costaatt.edu.tt',
});
