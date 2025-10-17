import { prisma } from '../utils/prisma';

export class MaintenanceScheduler {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.start();
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    const intervalHours = parseInt(process.env.PM_SCHEDULE_CHECK_INTERVAL_HOURS || '24');
    
    console.log(`📅 Maintenance Scheduler started - checking every ${intervalHours} hours`);
    
    // Run immediately on start
    this.checkScheduledMaintenance();
    
    // Then run on interval
    this.intervalId = setInterval(() => {
      this.checkScheduledMaintenance();
    }, intervalHours * 60 * 60 * 1000);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('🛑 Maintenance Scheduler stopped');
  }

  private async checkScheduledMaintenance() {
    try {
      console.log('🔍 Checking for scheduled maintenance...');
      
      const now = new Date();
      
      // Find maintenance schedules that are due
      const dueSchedules = await prisma.maintenanceSchedule.findMany({
        where: {
          nextDueDate: { lte: now },
          status: 'ACTIVE',
        },
        include: {
          assignedTo: true,
        }
      });

      if (dueSchedules.length > 0) {
        console.log(`📋 Found ${dueSchedules.length} maintenance schedules that are due`);
        
        for (const schedule of dueSchedules) {
          await this.createMaintenanceWorkOrder(schedule);
        }
      }

      console.log('✅ Maintenance schedule check completed');
    } catch (error) {
      console.error('❌ Error checking maintenance schedules:', error);
    }
  }

  private async createMaintenanceWorkOrder(schedule: any) {
    try {
      console.log(`🔧 Creating work order for maintenance schedule: ${schedule.title}`);
      
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
      const nextDueDate = this.calculateNextDueDate(schedule.nextDueDate, schedule.frequency);
      await prisma.maintenanceSchedule.update({
        where: { id: schedule.id },
        data: { nextDueDate }
      });

      console.log(`✅ Created work order ${workOrder.id} for maintenance schedule ${schedule.id}`);
      console.log(`📅 Next due date updated to: ${nextDueDate.toISOString()}`);
      
      return { workOrder, task, nextDueDate };
    } catch (error) {
      console.error(`❌ Error creating maintenance work order for schedule ${schedule.id}:`, error);
      throw error;
    }
  }

  private calculateNextDueDate(currentDate: Date, frequency: string): Date {
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
      default:
        console.warn(`Unknown frequency: ${frequency}, defaulting to monthly`);
        date.setMonth(date.getMonth() + 1);
    }
    
    return date;
  }

  // Manual trigger for testing
  async triggerCheck() {
    console.log('🔧 Manual maintenance schedule check triggered');
    await this.checkScheduledMaintenance();
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalHours: parseInt(process.env.PM_SCHEDULE_CHECK_INTERVAL_HOURS || '24'),
    };
  }
}

// Export singleton instance
export const maintenanceScheduler = new MaintenanceScheduler();
