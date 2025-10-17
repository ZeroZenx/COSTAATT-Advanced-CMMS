import { prisma } from '../utils/prisma';

export class SLAChecker {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.start();
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    const intervalMinutes = parseInt(process.env.SLA_ESCALATION_CHECK_INTERVAL_MINUTES || '60');
    
    console.log(`🕐 SLA Checker started - checking every ${intervalMinutes} minutes`);
    
    // Run immediately on start
    this.checkSLABreaches();
    
    // Then run on interval
    this.intervalId = setInterval(() => {
      this.checkSLABreaches();
    }, intervalMinutes * 60 * 1000);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('🛑 SLA Checker stopped');
  }

  private async checkSLABreaches() {
    try {
      console.log('🔍 Checking for SLA breaches...');
      
      const now = new Date();
      
      // Find SLA events that should be marked as breached
      const eventsToBreach = await prisma.sLAEvent.findMany({
        where: {
          targetAt: { lte: now },
          breached: false,
          resolvedAt: null,
        },
        include: {
          workOrder: {
            include: {
              createdBy: true,
              assignedTo: true,
            }
          }
        }
      });

      if (eventsToBreach.length > 0) {
        console.log(`⚠️ Found ${eventsToBreach.length} SLA events that have breached`);
        
        // Mark events as breached
        const breachIds = eventsToBreach.map(event => event.id);
        await prisma.sLAEvent.updateMany({
          where: { id: { in: breachIds } },
          data: { breached: true }
        });

        // Send notifications for each breach
        for (const event of eventsToBreach) {
          await this.sendBreachNotification(event);
        }
      }

      // Check for events that need escalation (breached for more than 2 hours)
      const eventsToEscalate = await prisma.sLAEvent.findMany({
        where: {
          breached: true,
          escalated: false,
          resolvedAt: null,
          targetAt: { lte: new Date(now.getTime() - 2 * 60 * 60 * 1000) }, // 2 hours ago
        },
        include: {
          workOrder: {
            include: {
              createdBy: true,
              assignedTo: true,
            }
          }
        }
      });

      if (eventsToEscalate.length > 0) {
        console.log(`🚨 Found ${eventsToEscalate.length} SLA events that need escalation`);
        
        // Mark events as escalated
        const escalateIds = eventsToEscalate.map(event => event.id);
        await prisma.sLAEvent.updateMany({
          where: { id: { in: escalateIds } },
          data: { escalated: true }
        });

        // Send escalation notifications
        for (const event of eventsToEscalate) {
          await this.sendEscalationNotification(event);
        }
      }

      console.log('✅ SLA breach check completed');
    } catch (error) {
      console.error('❌ Error checking SLA breaches:', error);
    }
  }

  private async sendBreachNotification(event: any) {
    try {
      // In a real system, this would send emails, SMS, or push notifications
      console.log(`📧 SLA BREACH NOTIFICATION:`);
      console.log(`   Work Order: ${event.workOrder.title}`);
      console.log(`   Target Time: ${event.targetAt.toISOString()}`);
      console.log(`   Created By: ${event.workOrder.createdBy.displayName}`);
      console.log(`   Assigned To: ${event.workOrder.assignedTo?.displayName || 'Unassigned'}`);
      console.log(`   Priority: ${event.workOrder.priority}`);
      
      // Here you would integrate with your notification service
      // await notificationService.sendEmail({
      //   to: [event.workOrder.createdBy.email, event.workOrder.assignedTo?.email].filter(Boolean),
      //   subject: `SLA Breach: ${event.workOrder.title}`,
      //   template: 'sla-breach',
      //   data: { event, workOrder: event.workOrder }
      // });
    } catch (error) {
      console.error('Error sending breach notification:', error);
    }
  }

  private async sendEscalationNotification(event: any) {
    try {
      // In a real system, this would send escalation notifications to supervisors/managers
      console.log(`🚨 SLA ESCALATION NOTIFICATION:`);
      console.log(`   Work Order: ${event.workOrder.title}`);
      console.log(`   Breached Since: ${event.targetAt.toISOString()}`);
      console.log(`   Created By: ${event.workOrder.createdBy.displayName}`);
      console.log(`   Assigned To: ${event.workOrder.assignedTo?.displayName || 'Unassigned'}`);
      console.log(`   Priority: ${event.workOrder.priority}`);
      
      // Here you would integrate with your notification service
      // await notificationService.sendEmail({
      //   to: ['supervisor@costaatt.edu.tt', 'manager@costaatt.edu.tt'],
      //   subject: `SLA Escalation: ${event.workOrder.title}`,
      //   template: 'sla-escalation',
      //   data: { event, workOrder: event.workOrder }
      // });
    } catch (error) {
      console.error('Error sending escalation notification:', error);
    }
  }

  // Manual trigger for testing
  async triggerCheck() {
    console.log('🔧 Manual SLA check triggered');
    await this.checkSLABreaches();
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMinutes: parseInt(process.env.SLA_ESCALATION_CHECK_INTERVAL_MINUTES || '60'),
    };
  }
}

// Export singleton instance
export const slaChecker = new SLAChecker();
