import { prisma } from '../utils/prisma';
import { notificationService } from './NotificationService';

interface EnergyConsumptionData {
  assetId: string;
  location: string;
  consumption: number;
  unit: string;
  cost?: number;
  timestamp: Date;
}

interface EnergyReport {
  period: string;
  totalConsumption: number;
  totalCost: number;
  averageConsumption: number;
  peakConsumption: number;
  carbonFootprint: number;
  efficiency: number;
  recommendations: string[];
}

export class EnergyManagementService {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private carbonIntensity = 0.5; // kg CO2 per kWh (Trinidad & Tobago average)

  constructor() {
    this.start();
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('⚡ Energy Management Service started');
    
    // Run energy analysis every hour
    this.intervalId = setInterval(() => {
      this.analyzeEnergyConsumption();
    }, 60 * 60 * 1000);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('🛑 Energy Management Service stopped');
  }

  // Record energy consumption
  async recordEnergyConsumption(data: EnergyConsumptionData) {
    try {
      const consumption = await prisma.energyConsumption.create({
        data: {
          assetId: data.assetId,
          location: data.location,
          consumption: data.consumption,
          unit: data.unit,
          cost: data.cost,
          recordedAt: data.timestamp,
        },
      });

      // Check for energy alerts
      await this.checkEnergyAlerts(data);

      return consumption;
    } catch (error) {
      console.error('Error recording energy consumption:', error);
      throw error;
    }
  }

  // Analyze energy consumption patterns
  private async analyzeEnergyConsumption() {
    try {
      console.log('⚡ Analyzing energy consumption...');
      
      // Get consumption data for the last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const consumptionData = await prisma.energyConsumption.findMany({
        where: {
          recordedAt: { gte: yesterday },
        },
        orderBy: { recordedAt: 'asc' },
      });

      if (consumptionData.length === 0) return;

      // Analyze patterns
      const analysis = this.analyzeConsumptionPatterns(consumptionData);
      
      // Check for anomalies
      await this.checkEnergyAnomalies(analysis);
      
      // Generate recommendations
      const recommendations = this.generateEnergyRecommendations(analysis);
      
      // Store analysis results
      await this.storeEnergyAnalysis(analysis, recommendations);

      console.log('✅ Energy analysis completed');
    } catch (error) {
      console.error('Error analyzing energy consumption:', error);
    }
  }

  // Analyze consumption patterns
  private analyzeConsumptionPatterns(data: EnergyConsumptionData[]) {
    const totalConsumption = data.reduce((sum, d) => sum + d.consumption, 0);
    const totalCost = data.reduce((sum, d) => sum + (d.cost || 0), 0);
    const averageConsumption = totalConsumption / data.length;
    const peakConsumption = Math.max(...data.map(d => d.consumption));
    
    // Group by hour to find peak hours
    const hourlyConsumption = this.groupByHour(data);
    const peakHour = Object.entries(hourlyConsumption)
      .reduce((max, [hour, consumption]) => 
        consumption > max.consumption ? { hour, consumption } : max, 
        { hour: '0', consumption: 0 }
      );

    // Calculate efficiency (simplified)
    const efficiency = this.calculateEfficiency(data);

    return {
      totalConsumption,
      totalCost,
      averageConsumption,
      peakConsumption,
      peakHour: peakHour.hour,
      efficiency,
      dataPoints: data.length,
      hourlyConsumption,
    };
  }

  // Group consumption data by hour
  private groupByHour(data: EnergyConsumptionData[]): { [hour: string]: number } {
    const hourly: { [hour: string]: number } = {};
    
    for (const entry of data) {
      const hour = entry.timestamp.getHours().toString();
      hourly[hour] = (hourly[hour] || 0) + entry.consumption;
    }
    
    return hourly;
  }

  // Calculate energy efficiency (simplified metric)
  private calculateEfficiency(data: EnergyConsumptionData[]): number {
    if (data.length < 2) return 1.0;
    
    // Calculate variance in consumption
    const values = data.map(d => d.consumption);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Efficiency is inverse of coefficient of variation
    const coefficientOfVariation = stdDev / mean;
    return Math.max(0, 1 - coefficientOfVariation);
  }

  // Check for energy anomalies
  private async checkEnergyAnomalies(analysis: any) {
    const { averageConsumption, peakConsumption, efficiency } = analysis;
    
    // Check for unusually high consumption
    if (peakConsumption > averageConsumption * 2) {
      await this.sendEnergyAlert('high_consumption', {
        message: 'Unusually high energy consumption detected',
        peakConsumption,
        averageConsumption,
      });
    }
    
    // Check for low efficiency
    if (efficiency < 0.5) {
      await this.sendEnergyAlert('low_efficiency', {
        message: 'Low energy efficiency detected',
        efficiency,
      });
    }
  }

  // Send energy alert
  private async sendEnergyAlert(type: string, data: any) {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPERVISOR'] },
        isActive: true,
      },
    });

    for (const user of users) {
      await notificationService.sendNotification({
        userId: user.id,
        type: 'system_alert',
        priority: 'medium',
        channels: {
          email: true,
          push: true,
          webhook: true,
        },
        template: {
          subject: `Energy Alert: ${type.replace('_', ' ').toUpperCase()}`,
          body: data.message,
        },
        data: { type, ...data },
      });
    }
  }

  // Generate energy recommendations
  private generateEnergyRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];
    
    if (analysis.efficiency < 0.7) {
      recommendations.push('Consider implementing energy monitoring systems to improve efficiency');
    }
    
    if (analysis.peakConsumption > analysis.averageConsumption * 1.5) {
      recommendations.push('Investigate peak consumption periods and consider load balancing');
    }
    
    if (analysis.totalCost > 1000) {
      recommendations.push('Review energy contracts and consider renewable energy options');
    }
    
    if (analysis.hourlyConsumption['18'] > analysis.hourlyConsumption['6']) {
      recommendations.push('Consider shifting non-critical operations to off-peak hours');
    }
    
    return recommendations;
  }

  // Store energy analysis
  private async storeEnergyAnalysis(analysis: any, recommendations: string[]) {
    const reportData = {
      analysis,
      recommendations,
      generatedAt: new Date().toISOString(),
    };

    await prisma.sustainabilityReport.create({
      data: {
        period: 'daily',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        totalEnergy: analysis.totalConsumption,
        totalCost: analysis.totalCost,
        carbonFootprint: analysis.totalConsumption * this.carbonIntensity,
        reportData,
      },
    });
  }

  // Get energy consumption report
  async getEnergyReport(period: {
    startDate: Date;
    endDate: Date;
  }): Promise<EnergyReport> {
    const consumptionData = await prisma.energyConsumption.findMany({
      where: {
        recordedAt: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
      orderBy: { recordedAt: 'asc' },
    });

    if (consumptionData.length === 0) {
      return {
        period: `${period.startDate.toISOString()} to ${period.endDate.toISOString()}`,
        totalConsumption: 0,
        totalCost: 0,
        averageConsumption: 0,
        peakConsumption: 0,
        carbonFootprint: 0,
        efficiency: 0,
        recommendations: [],
      };
    }

    const analysis = this.analyzeConsumptionPatterns(consumptionData);
    const recommendations = this.generateEnergyRecommendations(analysis);
    const carbonFootprint = analysis.totalConsumption * this.carbonIntensity;

    return {
      period: `${period.startDate.toISOString()} to ${period.endDate.toISOString()}`,
      totalConsumption: analysis.totalConsumption,
      totalCost: analysis.totalCost,
      averageConsumption: analysis.averageConsumption,
      peakConsumption: analysis.peakConsumption,
      carbonFootprint,
      efficiency: analysis.efficiency,
      recommendations,
    };
  }

  // Get energy consumption trends
  async getEnergyTrends(days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const consumptionData = await prisma.energyConsumption.findMany({
      where: {
        recordedAt: { gte: startDate },
      },
      orderBy: { recordedAt: 'asc' },
    });

    // Group by day
    const dailyConsumption: { [date: string]: number } = {};
    const dailyCost: { [date: string]: number } = {};
    
    for (const entry of consumptionData) {
      const date = entry.recordedAt.toISOString().split('T')[0];
      dailyConsumption[date] = (dailyConsumption[date] || 0) + entry.consumption;
      dailyCost[date] = (dailyCost[date] || 0) + (entry.cost || 0);
    }

    return {
      dailyConsumption: Object.entries(dailyConsumption).map(([date, consumption]) => ({
        date,
        consumption,
        cost: dailyCost[date] || 0,
        carbonFootprint: consumption * this.carbonIntensity,
      })),
      totalConsumption: Object.values(dailyConsumption).reduce((sum, val) => sum + val, 0),
      totalCost: Object.values(dailyCost).reduce((sum, val) => sum + val, 0),
    };
  }

  // Get energy consumption by location
  async getEnergyByLocation(period: {
    startDate: Date;
    endDate: Date;
  }) {
    const consumptionData = await prisma.energyConsumption.findMany({
      where: {
        recordedAt: {
          gte: period.startDate,
          lte: period.endDate,
        },
      },
    });

    // Group by location
    const locationData: { [location: string]: any } = {};
    
    for (const entry of consumptionData) {
      if (!locationData[entry.location]) {
        locationData[entry.location] = {
          totalConsumption: 0,
          totalCost: 0,
          count: 0,
        };
      }
      
      locationData[entry.location].totalConsumption += entry.consumption;
      locationData[entry.location].totalCost += entry.cost || 0;
      locationData[entry.location].count += 1;
    }

    return Object.entries(locationData).map(([location, data]) => ({
      location,
      totalConsumption: data.totalConsumption,
      totalCost: data.totalCost,
      averageConsumption: data.totalConsumption / data.count,
      carbonFootprint: data.totalConsumption * this.carbonIntensity,
    }));
  }

  // Get sustainability metrics
  async getSustainabilityMetrics() {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    const [monthlyData, yearlyData] = await Promise.all([
      prisma.energyConsumption.aggregate({
        where: { recordedAt: { gte: thisMonth } },
        _sum: { consumption: true, cost: true },
      }),
      prisma.energyConsumption.aggregate({
        where: { recordedAt: { gte: thisYear } },
        _sum: { consumption: true, cost: true },
      }),
    ]);

    const monthlyConsumption = monthlyData._sum.consumption || 0;
    const yearlyConsumption = yearlyData._sum.consumption || 0;
    const monthlyCost = monthlyData._sum.cost || 0;
    const yearlyCost = yearlyData._sum.cost || 0;

    return {
      monthly: {
        consumption: monthlyConsumption,
        cost: monthlyCost,
        carbonFootprint: monthlyConsumption * this.carbonIntensity,
      },
      yearly: {
        consumption: yearlyConsumption,
        cost: yearlyCost,
        carbonFootprint: yearlyConsumption * this.carbonIntensity,
      },
      carbonIntensity: this.carbonIntensity,
      recommendations: this.generateSustainabilityRecommendations(monthlyConsumption, yearlyConsumption),
    };
  }

  // Generate sustainability recommendations
  private generateSustainabilityRecommendations(monthly: number, yearly: number): string[] {
    const recommendations: string[] = [];
    
    if (yearly > 100000) {
      recommendations.push('Consider implementing renewable energy sources (solar panels, wind turbines)');
    }
    
    if (monthly > 10000) {
      recommendations.push('Implement energy-efficient lighting and HVAC systems');
    }
    
    if (yearly > 50000) {
      recommendations.push('Consider energy storage systems for peak shaving');
    }
    
    recommendations.push('Implement regular energy audits to identify optimization opportunities');
    recommendations.push('Consider carbon offset programs to achieve carbon neutrality');
    
    return recommendations;
  }

  // Simulate energy consumption data for testing
  async simulateEnergyData(assetId: string, location: string, days = 30) {
    const data: EnergyConsumptionData[] = [];
    const now = Date.now();
    const interval = 60 * 60 * 1000; // 1 hour intervals
    
    for (let i = 0; i < days * 24; i++) {
      const timestamp = new Date(now - (days * 24 - i) * interval);
      const hour = timestamp.getHours();
      
      // Simulate consumption based on time of day
      let baseConsumption = 100;
      if (hour >= 6 && hour <= 18) {
        baseConsumption = 150 + Math.random() * 50; // Higher during day
      } else {
        baseConsumption = 50 + Math.random() * 30; // Lower at night
      }
      
      data.push({
        assetId,
        location,
        consumption: baseConsumption,
        unit: 'kWh',
        cost: baseConsumption * 0.15, // $0.15 per kWh
        timestamp,
      });
    }

    // Store all data
    await prisma.energyConsumption.createMany({
      data: data.map(d => ({
        assetId: d.assetId,
        location: d.location,
        consumption: d.consumption,
        unit: d.unit,
        cost: d.cost,
        recordedAt: d.timestamp,
      })),
    });

    return data;
  }
}

export const energyManagementService = new EnergyManagementService();
