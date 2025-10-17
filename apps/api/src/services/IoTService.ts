import { prisma } from '../utils/prisma';
import { notificationService } from './NotificationService';
import { workflowEngine } from './WorkflowEngine';

interface SensorReading {
  sensorId: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: any;
}

interface SensorAlert {
  sensorId: string;
  type: 'threshold_exceeded' | 'anomaly_detected' | 'sensor_offline' | 'battery_low';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  value?: number;
  threshold?: number;
}

export class IoTService {
  private sensorThresholds: Map<string, any> = new Map();
  private anomalyDetectors: Map<string, any> = new Map();
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeThresholds();
    this.start();
  }

  // Initialize sensor thresholds and anomaly detectors
  private async initializeThresholds() {
    try {
      const sensors = await prisma.sensor.findMany({
        where: { isActive: true },
      });

      for (const sensor of sensors) {
        this.sensorThresholds.set(sensor.id, {
          min: this.getDefaultMinThreshold(sensor.type),
          max: this.getDefaultMaxThreshold(sensor.type),
          anomalyThreshold: 2.0, // Standard deviations
        });

        this.anomalyDetectors.set(sensor.id, {
          readings: [],
          mean: 0,
          stdDev: 0,
          maxReadings: 100,
        });
      }

      console.log(`🔌 Initialized ${sensors.length} IoT sensors`);
    } catch (error) {
      console.error('Error initializing IoT service:', error);
    }
  }

  // Get default thresholds based on sensor type
  private getDefaultMinThreshold(sensorType: string): number {
    const thresholds: any = {
      temperature: 15,
      humidity: 20,
      vibration: 0.1,
      pressure: 80,
      voltage: 200,
      current: 0.5,
      power: 0,
      flow: 0,
    };
    return thresholds[sensorType] || 0;
  }

  private getDefaultMaxThreshold(sensorType: string): number {
    const thresholds: any = {
      temperature: 35,
      humidity: 80,
      vibration: 2.0,
      pressure: 120,
      voltage: 250,
      current: 20,
      power: 5000,
      flow: 100,
    };
    return thresholds[sensorType] || 100;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🔌 IoT Service started');
    
    // Process sensor data every 30 seconds
    this.intervalId = setInterval(() => {
      this.processSensorData();
    }, 30000);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('🛑 IoT Service stopped');
  }

  // Process incoming sensor data
  async processSensorReading(reading: SensorReading) {
    try {
      // Store reading in database
      await prisma.sensorReading.create({
        data: {
          sensorId: reading.sensorId,
          value: reading.value,
          unit: reading.unit,
          timestamp: reading.timestamp,
          metadata: reading.metadata,
        },
      });

      // Update anomaly detector
      await this.updateAnomalyDetector(reading);

      // Check for alerts
      const alerts = await this.checkSensorAlerts(reading);
      
      for (const alert of alerts) {
        await this.handleSensorAlert(alert);
      }

      // Trigger workflows if needed
      await this.triggerWorkflows(reading);

    } catch (error) {
      console.error('Error processing sensor reading:', error);
    }
  }

  // Process all sensor data (for batch processing)
  private async processSensorData() {
    try {
      // Get recent readings that haven't been processed
      const recentReadings = await prisma.sensorReading.findMany({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
        include: {
          sensor: true,
        },
        orderBy: { timestamp: 'asc' },
      });

      for (const reading of recentReadings) {
        await this.processSensorReading({
          sensorId: reading.sensorId,
          value: reading.value,
          unit: reading.unit,
          timestamp: reading.timestamp,
          metadata: reading.metadata,
        });
      }
    } catch (error) {
      console.error('Error processing sensor data:', error);
    }
  }

  // Update anomaly detector with new reading
  private async updateAnomalyDetector(reading: SensorReading) {
    const detector = this.anomalyDetectors.get(reading.sensorId);
    if (!detector) return;

    detector.readings.push(reading.value);
    
    // Keep only recent readings
    if (detector.readings.length > detector.maxReadings) {
      detector.readings.shift();
    }

    // Calculate mean and standard deviation
    if (detector.readings.length >= 10) {
      const mean = detector.readings.reduce((sum, val) => sum + val, 0) / detector.readings.length;
      const variance = detector.readings.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / detector.readings.length;
      const stdDev = Math.sqrt(variance);

      detector.mean = mean;
      detector.stdDev = stdDev;
    }
  }

  // Check for sensor alerts
  private async checkSensorAlerts(reading: SensorReading): Promise<SensorAlert[]> {
    const alerts: SensorAlert[] = [];
    const thresholds = this.sensorThresholds.get(reading.sensorId);
    const detector = this.anomalyDetectors.get(reading.sensorId);

    if (!thresholds) return alerts;

    // Check threshold alerts
    if (reading.value < thresholds.min) {
      alerts.push({
        sensorId: reading.sensorId,
        type: 'threshold_exceeded',
        severity: 'medium',
        message: `Sensor reading below minimum threshold (${reading.value} < ${thresholds.min})`,
        value: reading.value,
        threshold: thresholds.min,
      });
    }

    if (reading.value > thresholds.max) {
      alerts.push({
        sensorId: reading.sensorId,
        type: 'threshold_exceeded',
        severity: 'high',
        message: `Sensor reading above maximum threshold (${reading.value} > ${thresholds.max})`,
        value: reading.value,
        threshold: thresholds.max,
      });
    }

    // Check anomaly alerts
    if (detector && detector.stdDev > 0) {
      const zScore = Math.abs((reading.value - detector.mean) / detector.stdDev);
      
      if (zScore > thresholds.anomalyThreshold) {
        alerts.push({
          sensorId: reading.sensorId,
          type: 'anomaly_detected',
          severity: zScore > 3 ? 'critical' : 'high',
          message: `Anomalous reading detected (z-score: ${zScore.toFixed(2)})`,
          value: reading.value,
        });
      }
    }

    return alerts;
  }

  // Handle sensor alert
  private async handleSensorAlert(alert: SensorAlert) {
    try {
      const sensor = await prisma.sensor.findUnique({
        where: { id: alert.sensorId },
        include: {
          readings: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
      });

      if (!sensor) return;

      // Create work order for critical alerts
      if (alert.severity === 'critical' || alert.severity === 'high') {
        const workOrder = await prisma.workOrder.create({
          data: {
            title: `IoT Alert: ${sensor.name} - ${alert.type.replace('_', ' ').toUpperCase()}`,
            description: `${alert.message}\n\nSensor: ${sensor.name}\nLocation: ${sensor.location}\nValue: ${alert.value} ${sensor.readings[0]?.unit || ''}`,
            priority: alert.severity === 'critical' ? 'URGENT' : 'HIGH',
            status: 'OPEN',
            location: sensor.location,
            category: 'IoT Alert',
            createdById: 'system',
          },
        });

        // Send notifications
        await this.sendAlertNotifications(alert, sensor, workOrder);
      }

      // Log alert
      console.log(`🚨 IoT Alert: ${sensor.name} - ${alert.message}`);

    } catch (error) {
      console.error('Error handling sensor alert:', error);
    }
  }

  // Send alert notifications
  private async sendAlertNotifications(alert: SensorAlert, sensor: any, workOrder: any) {
    // Get users who should be notified (supervisors, technicians)
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['SUPERVISOR', 'TECHNICIAN'] },
        isActive: true,
      },
    });

    for (const user of users) {
      await notificationService.sendNotification({
        userId: user.id,
        type: 'work_order_created',
        priority: alert.severity === 'critical' ? 'urgent' : 'high',
        channels: {
          email: true,
          sms: alert.severity === 'critical',
          push: true,
          webhook: true,
        },
        template: {
          subject: `IoT Alert: ${sensor.name}`,
          body: `${alert.message}\nLocation: ${sensor.location}\nWork Order: ${workOrder.id}`,
        },
        data: { alert, sensor, workOrder },
      });
    }
  }

  // Trigger workflows based on sensor data
  private async triggerWorkflows(reading: SensorReading) {
    // This would integrate with the workflow engine
    // For now, we'll create a simple rule-based approach
    
    const sensor = await prisma.sensor.findUnique({
      where: { id: reading.sensorId },
    });

    if (!sensor) return;

    // Example: If temperature is too high, trigger cooling workflow
    if (sensor.type === 'temperature' && reading.value > 30) {
      await workflowEngine.createRule({
        name: `Temperature Alert - ${sensor.name}`,
        trigger: 'sensor_alert',
        conditions: [
          { field: 'sensorId', operator: 'equals', value: reading.sensorId },
          { field: 'value', operator: 'greater_than', value: 30 },
        ],
        actions: [
          {
            type: 'send_notification',
            config: {
              userId: 'supervisor',
              type: 'system_alert',
              priority: 'high',
            },
          },
        ],
        priority: 1,
        isActive: true,
      });
    }
  }

  // Public API methods
  async getSensorData(sensorId: string, hours = 24) {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return prisma.sensorReading.findMany({
      where: {
        sensorId,
        timestamp: { gte: startTime },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getSensorStatus() {
    const sensors = await prisma.sensor.findMany({
      where: { isActive: true },
      include: {
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    return sensors.map(sensor => ({
      id: sensor.id,
      name: sensor.name,
      type: sensor.type,
      location: sensor.location,
      lastReading: sensor.readings[0],
      status: this.getSensorStatus(sensor),
    }));
  }

  private getSensorStatus(sensor: any): 'online' | 'offline' | 'warning' | 'error' {
    if (!sensor.readings.length) return 'offline';
    
    const lastReading = sensor.readings[0];
    const timeSinceLastReading = Date.now() - lastReading.timestamp.getTime();
    
    if (timeSinceLastReading > 5 * 60 * 1000) return 'offline'; // 5 minutes
    
    const thresholds = this.sensorThresholds.get(sensor.id);
    if (!thresholds) return 'online';
    
    if (lastReading.value < thresholds.min || lastReading.value > thresholds.max) {
      return 'warning';
    }
    
    return 'online';
  }

  async createSensor(sensorData: {
    name: string;
    type: string;
    location: string;
    assetId?: string;
  }) {
    const sensor = await prisma.sensor.create({
      data: sensorData,
    });

    // Initialize thresholds and detector
    this.sensorThresholds.set(sensor.id, {
      min: this.getDefaultMinThreshold(sensor.type),
      max: this.getDefaultMaxThreshold(sensor.type),
      anomalyThreshold: 2.0,
    });

    this.anomalyDetectors.set(sensor.id, {
      readings: [],
      mean: 0,
      stdDev: 0,
      maxReadings: 100,
    });

    return sensor;
  }

  async updateSensorThresholds(sensorId: string, thresholds: {
    min?: number;
    max?: number;
    anomalyThreshold?: number;
  }) {
    const current = this.sensorThresholds.get(sensorId) || {};
    this.sensorThresholds.set(sensorId, { ...current, ...thresholds });
  }

  async getSensorAlerts(hours = 24) {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // This would typically be stored in a separate alerts table
    // For now, we'll return work orders created by IoT alerts
    return prisma.workOrder.findMany({
      where: {
        category: 'IoT Alert',
        createdAt: { gte: startTime },
      },
      include: {
        createdBy: true,
        assignedTo: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Simulate sensor data for testing
  async simulateSensorData(sensorId: string, duration = 60) {
    const sensor = await prisma.sensor.findUnique({
      where: { id: sensorId },
    });

    if (!sensor) throw new Error('Sensor not found');

    const readings = [];
    const now = Date.now();
    const interval = 30 * 1000; // 30 seconds

    for (let i = 0; i < duration; i++) {
      const timestamp = new Date(now - (duration - i) * interval);
      const value = this.generateSimulatedValue(sensor.type);
      
      readings.push({
        sensorId,
        value,
        unit: this.getUnitForType(sensor.type),
        timestamp,
        metadata: { simulated: true },
      });
    }

    // Store all readings
    await prisma.sensorReading.createMany({
      data: readings,
    });

    return readings;
  }

  private generateSimulatedValue(sensorType: string): number {
    const ranges: any = {
      temperature: { min: 18, max: 28 },
      humidity: { min: 40, max: 70 },
      vibration: { min: 0.1, max: 1.5 },
      pressure: { min: 90, max: 110 },
      voltage: { min: 220, max: 240 },
      current: { min: 5, max: 15 },
      power: { min: 1000, max: 3000 },
      flow: { min: 10, max: 50 },
    };

    const range = ranges[sensorType] || { min: 0, max: 100 };
    return range.min + Math.random() * (range.max - range.min);
  }

  private getUnitForType(sensorType: string): string {
    const units: any = {
      temperature: '°C',
      humidity: '%',
      vibration: 'g',
      pressure: 'kPa',
      voltage: 'V',
      current: 'A',
      power: 'W',
      flow: 'L/min',
    };
    return units[sensorType] || 'units';
  }
}

export const iotService = new IoTService();
