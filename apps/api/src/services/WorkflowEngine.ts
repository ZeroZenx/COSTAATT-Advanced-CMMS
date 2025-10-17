import { prisma } from '../utils/prisma';
import { notificationService } from './NotificationService';

interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

interface WorkflowAction {
  type: 'send_notification' | 'assign_user' | 'update_status' | 'create_task' | 'escalate' | 'webhook';
  config: any;
}

interface WorkflowRule {
  id: string;
  name: string;
  trigger: string;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  priority: number;
  isActive: boolean;
}

export class WorkflowEngine {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.start();
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🔄 Workflow Engine started');
    
    // Run workflow checks every 30 seconds
    this.intervalId = setInterval(() => {
      this.processWorkflows();
    }, 30000);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('🛑 Workflow Engine stopped');
  }

  // Process all active workflows
  private async processWorkflows() {
    try {
      const rules = await this.getActiveRules();
      
      for (const rule of rules) {
        await this.processRule(rule);
      }
    } catch (error) {
      console.error('Error processing workflows:', error);
    }
  }

  // Get all active workflow rules
  private async getActiveRules(): Promise<WorkflowRule[]> {
    const rules = await prisma.workflowRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });

    return rules.map(rule => ({
      id: rule.id,
      name: rule.name,
      trigger: rule.trigger,
      conditions: rule.conditions as WorkflowCondition[],
      actions: rule.actions as WorkflowAction[],
      priority: rule.priority,
      isActive: rule.isActive,
    }));
  }

  // Process a single workflow rule
  private async processRule(rule: WorkflowRule) {
    try {
      // Get entities that match the trigger
      const entities = await this.getEntitiesForTrigger(rule.trigger);
      
      for (const entity of entities) {
        // Check if conditions are met
        if (await this.evaluateConditions(rule.conditions, entity)) {
          // Execute actions
          await this.executeActions(rule, entity);
        }
      }
    } catch (error) {
      console.error(`Error processing rule ${rule.name}:`, error);
    }
  }

  // Get entities based on trigger type
  private async getEntitiesForTrigger(trigger: string) {
    switch (trigger) {
      case 'work_order_created':
        return prisma.workOrder.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
            },
          },
          include: {
            createdBy: true,
            assignedTo: true,
          },
        });

      case 'work_order_updated':
        return prisma.workOrder.findMany({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
            },
          },
          include: {
            createdBy: true,
            assignedTo: true,
          },
        });

      case 'work_order_overdue':
        return prisma.workOrder.findMany({
          where: {
            status: { in: ['OPEN', 'IN_PROGRESS'] },
            dueDate: { lte: new Date() },
          },
          include: {
            createdBy: true,
            assignedTo: true,
          },
        });

      case 'sla_breach':
        return prisma.sLAEvent.findMany({
          where: {
            breached: true,
            resolvedAt: null,
          },
          include: {
            workOrder: {
              include: {
                createdBy: true,
                assignedTo: true,
              },
            },
          },
        });

      case 'maintenance_due':
        return prisma.maintenanceSchedule.findMany({
          where: {
            nextDueDate: { lte: new Date() },
            status: 'ACTIVE',
          },
          include: {
            assignedTo: true,
          },
        });

      case 'inventory_low':
        return prisma.inventoryItem.findMany({
          where: {
            quantity: { lte: prisma.inventoryItem.fields.reorderLevel },
          },
        });

      default:
        return [];
    }
  }

  // Evaluate workflow conditions
  private async evaluateConditions(conditions: WorkflowCondition[], entity: any): Promise<boolean> {
    for (const condition of conditions) {
      if (!this.evaluateCondition(condition, entity)) {
        return false;
      }
    }
    return true;
  }

  // Evaluate a single condition
  private evaluateCondition(condition: WorkflowCondition, entity: any): boolean {
    const fieldValue = this.getFieldValue(entity, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
      default:
        return false;
    }
  }

  // Get field value from entity (supports nested properties)
  private getFieldValue(entity: any, field: string): any {
    return field.split('.').reduce((obj, key) => obj?.[key], entity);
  }

  // Execute workflow actions
  private async executeActions(rule: WorkflowRule, entity: any) {
    for (const action of rule.actions) {
      try {
        await this.executeAction(action, rule, entity);
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
      }
    }
  }

  // Execute a single action
  private async executeAction(action: WorkflowAction, rule: WorkflowRule, entity: any) {
    switch (action.type) {
      case 'send_notification':
        await this.sendNotificationAction(action, entity);
        break;
      case 'assign_user':
        await this.assignUserAction(action, entity);
        break;
      case 'update_status':
        await this.updateStatusAction(action, entity);
        break;
      case 'create_task':
        await this.createTaskAction(action, entity);
        break;
      case 'escalate':
        await this.escalateAction(action, entity);
        break;
      case 'webhook':
        await this.webhookAction(action, entity);
        break;
    }

    // Log execution
    await this.logExecution(rule.id, entity.id, action, 'completed');
  }

  // Send notification action
  private async sendNotificationAction(action: WorkflowAction, entity: any) {
    const { userId, type, priority = 'medium' } = action.config;
    
    const templates = notificationService.constructor.getTemplates();
    const template = templates[type as keyof typeof templates] || templates.system_alert;

    await notificationService.sendNotification({
      userId,
      type: type as any,
      priority: priority as any,
      channels: {
        email: true,
        sms: false,
        push: true,
        webhook: true,
      },
      template,
      data: { entity, workflow: true },
    });
  }

  // Assign user action
  private async assignUserAction(action: WorkflowAction, entity: any) {
    const { userId, workOrderId } = action.config;
    
    if (workOrderId) {
      await prisma.workOrder.update({
        where: { id: workOrderId },
        data: { assignedToId: userId },
      });
    }
  }

  // Update status action
  private async updateStatusAction(action: WorkflowAction, entity: any) {
    const { status, workOrderId } = action.config;
    
    if (workOrderId) {
      await prisma.workOrder.update({
        where: { id: workOrderId },
        data: { status },
      });
    }
  }

  // Create task action
  private async createTaskAction(action: WorkflowAction, entity: any) {
    const { title, description, assignedToId, workOrderId } = action.config;
    
    await prisma.maintenanceTask.create({
      data: {
        scheduleId: entity.id,
        workOrderId,
        notes: `${title}: ${description}`,
        completedById: assignedToId,
      },
    });
  }

  // Escalate action
  private async escalateAction(action: WorkflowAction, entity: any) {
    const { escalateTo, workOrderId } = action.config;
    
    if (workOrderId) {
      await prisma.workOrder.update({
        where: { id: workOrderId },
        data: { assignedToId: escalateTo },
      });

      // Send escalation notification
      await notificationService.sendNotification({
        userId: escalateTo,
        type: 'sla_escalation',
        priority: 'urgent',
        channels: {
          email: true,
          sms: true,
          push: true,
          webhook: true,
        },
        template: notificationService.constructor.getTemplates().sla_escalation,
        data: { entity, escalated: true },
      });
    }
  }

  // Webhook action
  private async webhookAction(action: WorkflowAction, entity: any) {
    const { url, method = 'POST', headers = {} } = action.config;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          entity,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Webhook action failed:', error);
      throw error;
    }
  }

  // Log workflow execution
  private async logExecution(ruleId: string, entityId: string, action: WorkflowAction, status: string) {
    await prisma.workflowExecution.create({
      data: {
        ruleId,
        workOrderId: entityId.startsWith('work_order_') ? entityId : null,
        status,
        result: { action: action.type, status },
      },
    });
  }

  // Create a new workflow rule
  async createRule(ruleData: Omit<WorkflowRule, 'id'>) {
    return prisma.workflowRule.create({
      data: {
        name: ruleData.name,
        description: ruleData.name,
        trigger: ruleData.trigger,
        conditions: ruleData.conditions,
        actions: ruleData.actions,
        priority: ruleData.priority,
        isActive: ruleData.isActive,
      },
    });
  }

  // Update a workflow rule
  async updateRule(id: string, ruleData: Partial<WorkflowRule>) {
    return prisma.workflowRule.update({
      where: { id },
      data: {
        name: ruleData.name,
        description: ruleData.name,
        trigger: ruleData.trigger,
        conditions: ruleData.conditions,
        actions: ruleData.actions,
        priority: ruleData.priority,
        isActive: ruleData.isActive,
      },
    });
  }

  // Delete a workflow rule
  async deleteRule(id: string) {
    return prisma.workflowRule.delete({
      where: { id },
    });
  }

  // Get workflow execution history
  async getExecutionHistory(ruleId?: string, limit = 100) {
    return prisma.workflowExecution.findMany({
      where: ruleId ? { ruleId } : {},
      include: {
        rule: {
          select: {
            name: true,
            trigger: true,
          },
        },
        workOrder: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { executedAt: 'desc' },
      take: limit,
    });
  }
}

export const workflowEngine = new WorkflowEngine();
