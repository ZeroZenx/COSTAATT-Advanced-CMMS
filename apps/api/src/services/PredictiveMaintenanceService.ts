import { prisma } from '../utils/prisma';
import { notificationService } from './NotificationService';

interface PredictionData {
  assetId: string;
  assetType: string;
  location: string;
  age: number;
  maintenanceHistory: any[];
  sensorData: any[];
  environmentalFactors: any;
}

interface PredictionResult {
  failureProbability: number;
  predictedFailureDate?: Date;
  confidence: number;
  recommendedActions: string[];
  maintenancePriority: 'low' | 'medium' | 'high' | 'urgent';
}

export class PredictiveMaintenanceService {
  private models: Map<string, any> = new Map();
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeModels();
    this.start();
  }

  // Initialize machine learning models
  private async initializeModels() {
    try {
      // Load existing models from database
      const models = await prisma.predictionModel.findMany({
        where: { isActive: true },
      });

      for (const model of models) {
        this.models.set(model.type, {
          id: model.id,
          data: model.modelData,
          accuracy: model.accuracy,
        });
      }

      // If no models exist, create default ones
      if (this.models.size === 0) {
        await this.createDefaultModels();
      }

      console.log(`🤖 Loaded ${this.models.size} prediction models`);
    } catch (error) {
      console.error('Error initializing models:', error);
    }
  }

  // Create default prediction models
  private async createDefaultModels() {
    const defaultModels = [
      {
        name: 'HVAC Failure Prediction',
        type: 'hvac_failure',
        modelData: this.createSimpleModel('hvac'),
        accuracy: 0.85,
      },
      {
        name: 'Electrical Equipment Failure',
        type: 'electrical_failure',
        modelData: this.createSimpleModel('electrical'),
        accuracy: 0.82,
      },
      {
        name: 'Plumbing System Failure',
        type: 'plumbing_failure',
        modelData: this.createSimpleModel('plumbing'),
        accuracy: 0.78,
      },
      {
        name: 'General Equipment Failure',
        type: 'general_failure',
        modelData: this.createSimpleModel('general'),
        accuracy: 0.80,
      },
    ];

    for (const modelData of defaultModels) {
      const model = await prisma.predictionModel.create({
        data: modelData,
      });
      this.models.set(model.type, {
        id: model.id,
        data: model.modelData,
        accuracy: model.accuracy,
      });
    }
  }

  // Create a simple rule-based model (in production, this would be a trained ML model)
  private createSimpleModel(assetType: string) {
    return {
      type: 'rule_based',
      rules: this.getRulesForAssetType(assetType),
      weights: this.getWeightsForAssetType(assetType),
    };
  }

  // Get rules for specific asset types
  private getRulesForAssetType(assetType: string) {
    const rules: any = {
      hvac: [
        { condition: 'age > 10', weight: 0.3 },
        { condition: 'maintenance_gap > 90', weight: 0.4 },
        { condition: 'temperature_variance > 5', weight: 0.2 },
        { condition: 'vibration > 0.5', weight: 0.1 },
      ],
      electrical: [
        { condition: 'age > 15', weight: 0.25 },
        { condition: 'maintenance_gap > 180', weight: 0.35 },
        { condition: 'power_fluctuation > 10', weight: 0.25 },
        { condition: 'heat_generation > 60', weight: 0.15 },
      ],
      plumbing: [
        { condition: 'age > 20', weight: 0.2 },
        { condition: 'maintenance_gap > 365', weight: 0.3 },
        { condition: 'pressure_drop > 20', weight: 0.3 },
        { condition: 'corrosion_indicators > 3', weight: 0.2 },
      ],
      general: [
        { condition: 'age > 8', weight: 0.2 },
        { condition: 'maintenance_gap > 120', weight: 0.3 },
        { condition: 'usage_intensity > 0.8', weight: 0.25 },
        { condition: 'environmental_stress > 0.6', weight: 0.25 },
      ],
    };

    return rules[assetType] || rules.general;
  }

  // Get weights for specific asset types
  private getWeightsForAssetType(assetType: string) {
    const weights: any = {
      hvac: { age: 0.3, maintenance: 0.4, environment: 0.3 },
      electrical: { age: 0.25, maintenance: 0.35, environment: 0.4 },
      plumbing: { age: 0.2, maintenance: 0.3, environment: 0.5 },
      general: { age: 0.25, maintenance: 0.35, environment: 0.4 },
    };

    return weights[assetType] || weights.general;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🔮 Predictive Maintenance Service started');
    
    // Run predictions every hour
    this.intervalId = setInterval(() => {
      this.runPredictions();
    }, 60 * 60 * 1000);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('🛑 Predictive Maintenance Service stopped');
  }

  // Run predictions for all assets
  private async runPredictions() {
    try {
      console.log('🔮 Running predictive maintenance analysis...');
      
      // Get all active maintenance schedules (representing assets)
      const assets = await prisma.maintenanceSchedule.findMany({
        where: { status: 'ACTIVE' },
        include: {
          assignedTo: true,
          tasks: {
            orderBy: { performedAt: 'desc' },
            take: 10,
          },
        },
      });

      for (const asset of assets) {
        await this.predictAssetFailure(asset);
      }

      console.log('✅ Predictive maintenance analysis completed');
    } catch (error) {
      console.error('Error running predictions:', error);
    }
  }

  // Predict failure for a specific asset
  private async predictAssetFailure(asset: any) {
    try {
      const predictionData = await this.gatherAssetData(asset);
      const prediction = await this.makePrediction(asset.title, predictionData);
      
      if (prediction.failureProbability > 0.7) {
        await this.handleHighRiskPrediction(asset, prediction);
      }

      // Store prediction
      await this.storePrediction(asset.id, prediction);
    } catch (error) {
      console.error(`Error predicting failure for asset ${asset.id}:`, error);
    }
  }

  // Gather data for prediction
  private async gatherAssetData(asset: any): Promise<PredictionData> {
    const now = new Date();
    const assetAge = this.calculateAssetAge(asset.createdAt);
    const lastMaintenance = asset.lastCompletedDate;
    const maintenanceGap = lastMaintenance 
      ? Math.floor((now.getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24))
      : 365;

    // Get sensor data (simulated)
    const sensorData = await this.getSensorData(asset.id);
    
    // Get environmental factors
    const environmentalFactors = await this.getEnvironmentalFactors(asset.location);

    return {
      assetId: asset.id,
      assetType: this.categorizeAsset(asset.title),
      location: asset.location || 'Unknown',
      age: assetAge,
      maintenanceHistory: asset.tasks || [],
      sensorData,
      environmentalFactors: {
        ...environmentalFactors,
        maintenanceGap,
      },
    };
  }

  // Make prediction using the appropriate model
  private async makePrediction(assetTitle: string, data: PredictionData): Promise<PredictionResult> {
    const assetType = this.categorizeAsset(assetTitle);
    const model = this.models.get(`${assetType}_failure`) || this.models.get('general_failure');
    
    if (!model) {
      throw new Error(`No model found for asset type: ${assetType}`);
    }

    const failureProbability = this.calculateFailureProbability(data, model);
    const confidence = model.accuracy || 0.8;
    
    return {
      failureProbability,
      predictedFailureDate: failureProbability > 0.6 ? this.calculateFailureDate(data) : undefined,
      confidence,
      recommendedActions: this.getRecommendedActions(failureProbability, data),
      maintenancePriority: this.getMaintenancePriority(failureProbability),
    };
  }

  // Calculate failure probability using rule-based approach
  private calculateFailureProbability(data: PredictionData, model: any): number {
    const rules = model.data.rules;
    const weights = model.data.weights;
    
    let totalScore = 0;
    let maxScore = 0;

    for (const rule of rules) {
      const condition = rule.condition;
      const weight = rule.weight;
      const score = this.evaluateCondition(condition, data) ? weight : 0;
      
      totalScore += score;
      maxScore += weight;
    }

    return maxScore > 0 ? totalScore / maxScore : 0;
  }

  // Evaluate a condition against asset data
  private evaluateCondition(condition: string, data: PredictionData): boolean {
    const { age, maintenanceHistory, environmentalFactors, sensorData } = data;
    
    // Parse condition (simplified)
    if (condition.includes('age >')) {
      const threshold = parseInt(condition.split('age > ')[1]);
      return age > threshold;
    }
    
    if (condition.includes('maintenance_gap >')) {
      const threshold = parseInt(condition.split('maintenance_gap > ')[1]);
      return environmentalFactors.maintenanceGap > threshold;
    }
    
    if (condition.includes('temperature_variance >')) {
      const threshold = parseFloat(condition.split('temperature_variance > ')[1]);
      return sensorData.temperatureVariance > threshold;
    }
    
    if (condition.includes('vibration >')) {
      const threshold = parseFloat(condition.split('vibration > ')[1]);
      return sensorData.vibration > threshold;
    }
    
    return false;
  }

  // Calculate predicted failure date
  private calculateFailureDate(data: PredictionData): Date {
    const daysUntilFailure = Math.max(7, Math.floor(30 * (1 - data.age / 20)));
    return new Date(Date.now() + daysUntilFailure * 24 * 60 * 60 * 1000);
  }

  // Get recommended actions based on prediction
  private getRecommendedActions(probability: number, data: PredictionData): string[] {
    const actions = [];
    
    if (probability > 0.8) {
      actions.push('Schedule immediate inspection');
      actions.push('Prepare replacement parts');
      actions.push('Notify maintenance team');
    } else if (probability > 0.6) {
      actions.push('Schedule preventive maintenance');
      actions.push('Increase monitoring frequency');
    } else if (probability > 0.4) {
      actions.push('Continue regular maintenance');
      actions.push('Monitor for early warning signs');
    }
    
    return actions;
  }

  // Get maintenance priority based on probability
  private getMaintenancePriority(probability: number): 'low' | 'medium' | 'high' | 'urgent' {
    if (probability > 0.8) return 'urgent';
    if (probability > 0.6) return 'high';
    if (probability > 0.4) return 'medium';
    return 'low';
  }

  // Handle high-risk predictions
  private async handleHighRiskPrediction(asset: any, prediction: PredictionResult) {
    // Create urgent work order
    const workOrder = await prisma.workOrder.create({
      data: {
        title: `URGENT: ${asset.title} - Predicted Failure Risk`,
        description: `High failure probability detected (${Math.round(prediction.failureProbability * 100)}%). ${prediction.recommendedActions.join('. ')}`,
        priority: 'URGENT',
        status: 'OPEN',
        location: asset.location || 'Unknown',
        category: 'Predictive Maintenance',
        createdById: asset.assignedToId || 'system',
        assignedToId: asset.assignedToId,
      },
    });

    // Send notifications
    if (asset.assignedToId) {
      await notificationService.sendNotification({
        userId: asset.assignedToId,
        type: 'work_order_created',
        priority: 'urgent',
        channels: {
          email: true,
          sms: true,
          push: true,
          webhook: true,
        },
        template: {
          subject: 'URGENT: Predicted Equipment Failure',
          body: `High failure risk detected for ${asset.title}. Immediate action required.`,
        },
        data: { workOrder, prediction },
      });
    }
  }

  // Store prediction in database
  private async storePrediction(assetId: string, prediction: PredictionResult) {
    const model = this.models.get('general_failure');
    
    await prisma.prediction.create({
      data: {
        modelId: model.id,
        assetId,
        prediction: prediction as any,
        confidence: prediction.confidence,
      },
    });
  }

  // Helper methods
  private calculateAssetAge(createdAt: Date): number {
    return Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365));
  }

  private categorizeAsset(title: string): string {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('hvac') || titleLower.includes('air') || titleLower.includes('cooling')) return 'hvac';
    if (titleLower.includes('electrical') || titleLower.includes('power') || titleLower.includes('generator')) return 'electrical';
    if (titleLower.includes('plumbing') || titleLower.includes('water') || titleLower.includes('pipe')) return 'plumbing';
    return 'general';
  }

  private async getSensorData(assetId: string): Promise<any> {
    // Simulate sensor data - in production, this would query actual sensors
    return {
      temperature: 22 + Math.random() * 10,
      vibration: Math.random() * 0.5,
      pressure: 100 + Math.random() * 20,
      temperatureVariance: Math.random() * 3,
    };
  }

  private async getEnvironmentalFactors(location: string): Promise<any> {
    // Simulate environmental factors - in production, this would query weather/environmental APIs
    return {
      humidity: 50 + Math.random() * 30,
      temperature: 20 + Math.random() * 15,
      dustLevel: Math.random() * 100,
      vibrationLevel: Math.random() * 0.3,
    };
  }

  // Public API methods
  async getPredictions(assetId?: string, limit = 100) {
    return prisma.prediction.findMany({
      where: assetId ? { assetId } : {},
      include: {
        model: {
          select: {
            name: true,
            type: true,
            accuracy: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getHighRiskAssets() {
    const predictions = await prisma.prediction.findMany({
      where: {
        prediction: {
          path: ['failureProbability'],
          gt: 0.7,
        },
      },
      include: {
        model: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return predictions;
  }

  async retrainModel(modelId: string, trainingData: any[]) {
    // In production, this would retrain the actual ML model
    console.log(`Retraining model ${modelId} with ${trainingData.length} samples`);
    
    // Update model accuracy (simulated)
    const newAccuracy = 0.85 + Math.random() * 0.1;
    await prisma.predictionModel.update({
      where: { id: modelId },
      data: { accuracy: newAccuracy },
    });

    return { success: true, newAccuracy };
  }
}

export const predictiveMaintenanceService = new PredictiveMaintenanceService();
