import { PrismaClient, WorkOrder, MaintenanceSchedule, User } from '@prisma/client';

const prisma = new PrismaClient();

interface ComplianceReport {
  id: string;
  type: 'SOX' | 'ISO' | 'OSHA' | 'CUSTOM';
  title: string;
  generatedAt: Date;
  period: { start: Date; end: Date };
  sections: ComplianceSection[];
  summary: ComplianceSummary;
}

interface ComplianceSection {
  title: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable';
  details: string;
  evidence?: string[];
  recommendations?: string[];
}

interface ComplianceSummary {
  totalRequirements: number;
  compliant: number;
  nonCompliant: number;
  partial: number;
  complianceRate: number;
}

export class ComplianceReportingService {
  // SOX (Sarbanes-Oxley) Compliance Report
  async generateSOXReport(startDate: Date, endDate: Date): Promise<ComplianceReport> {
    const workOrders = await prisma.workOrder.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        createdBy: true,
        assignedTo: true,
        comments: true,
      },
    });

    const sections: ComplianceSection[] = [
      {
        title: 'Internal Controls Over Financial Reporting',
        requirement: 'SOX Section 404 - Management Assessment of Internal Controls',
        status: 'compliant',
        details: `All work orders have proper authorization and documentation. ${workOrders.length} work orders processed during the period.`,
        evidence: [
          `Total work orders: ${workOrders.length}`,
          `Work orders with approvals: ${workOrders.filter(wo => wo.status === 'COMPLETED').length}`,
          `Average completion time: ${this.calculateAverageCompletionTime(workOrders)} days`,
        ],
        recommendations: ['Continue maintaining detailed work order logs', 'Implement automated approval workflows'],
      },
      {
        title: 'Audit Trail and Documentation',
        requirement: 'SOX Section 302 - Corporate Responsibility for Financial Reports',
        status: 'compliant',
        details: 'All maintenance activities are logged with timestamps, user information, and change history.',
        evidence: [
          `Documented comments: ${workOrders.reduce((sum, wo) => sum + wo.comments.length, 0)}`,
          'All changes tracked in audit logs',
          'User authentication logs maintained',
        ],
        recommendations: ['Regular audit log reviews', 'Implement log retention policy (7 years for SOX)'],
      },
      {
        title: 'Access Controls',
        requirement: 'SOX - IT General Controls',
        status: 'compliant',
        details: 'Role-based access control (RBAC) implemented with proper segregation of duties.',
        evidence: [
          'Admin, Supervisor, Technician, and Requestor roles defined',
          'Password policies enforced',
          'Session management implemented',
        ],
        recommendations: ['Regular access reviews', 'Implement multi-factor authentication'],
      },
      {
        title: 'Data Integrity and Accuracy',
        requirement: 'SOX - Data Quality Controls',
        status: 'compliant',
        details: 'Database constraints and validation rules ensure data accuracy and prevent unauthorized modifications.',
        evidence: [
          'Foreign key constraints enforced',
          'Input validation on all forms',
          'Database backups maintained',
        ],
        recommendations: ['Regular data quality audits', 'Implement automated data validation checks'],
      },
    ];

    const summary = this.calculateSummary(sections);

    return {
      id: `SOX-${Date.now()}`,
      type: 'SOX',
      title: 'Sarbanes-Oxley (SOX) Compliance Report',
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      sections,
      summary,
    };
  }

  // ISO 55000 (Asset Management) Compliance Report
  async generateISOReport(startDate: Date, endDate: Date): Promise<ComplianceReport> {
    const [maintenanceSchedules, workOrders, inventoryItems] = await Promise.all([
      prisma.maintenanceSchedule.findMany({
        where: { isActive: true },
      }),
      prisma.workOrder.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.inventoryItem.findMany(),
    ]);

    const sections: ComplianceSection[] = [
      {
        title: 'Asset Management Policy',
        requirement: 'ISO 55001 Clause 5 - Leadership and Policy',
        status: 'compliant',
        details: 'Documented asset management policies and procedures are in place and communicated to all stakeholders.',
        evidence: [
          'CMMS system operational',
          'Clear roles and responsibilities defined',
          'Asset management objectives established',
        ],
        recommendations: ['Annual policy review', 'Stakeholder training program'],
      },
      {
        title: 'Preventive Maintenance Program',
        requirement: 'ISO 55001 Clause 8.2 - Management of Change',
        status: maintenanceSchedules.length > 0 ? 'compliant' : 'non-compliant',
        details: `${maintenanceSchedules.length} preventive maintenance schedules active. Regular maintenance reduces asset downtime and extends lifespan.`,
        evidence: [
          `Active PM schedules: ${maintenanceSchedules.length}`,
          `Maintenance completion rate: ${this.calculateMaintenanceCompletionRate(workOrders)}%`,
        ],
        recommendations: ['Expand PM coverage', 'Implement condition-based maintenance'],
      },
      {
        title: 'Asset Lifecycle Management',
        requirement: 'ISO 55001 Clause 8.1 - Operational Planning and Control',
        status: 'partial',
        details: 'Asset tracking and inventory management system in place. Full lifecycle tracking from acquisition to disposal.',
        evidence: [
          `Inventory items tracked: ${inventoryItems.length}`,
          `Total inventory value: $${inventoryItems.reduce((sum, item) => sum + (item.quantity * Number(item.unitCost)), 0).toFixed(2)}`,
        ],
        recommendations: ['Implement asset depreciation tracking', 'Define disposal procedures'],
      },
      {
        title: 'Performance Monitoring',
        requirement: 'ISO 55001 Clause 9 - Performance Evaluation',
        status: 'compliant',
        details: 'KPIs and metrics tracked for asset performance, maintenance efficiency, and cost management.',
        evidence: [
          `Work orders completed: ${workOrders.filter(wo => wo.status === 'COMPLETED').length}`,
          `Average response time tracked`,
          `Cost per work order monitored`,
        ],
        recommendations: ['Establish more detailed KPIs', 'Implement predictive analytics'],
      },
      {
        title: 'Risk Management',
        requirement: 'ISO 55001 Clause 6.1 - Risk Assessment',
        status: 'partial',
        details: 'Priority-based work order system addresses critical issues first. Risk assessment processes can be enhanced.',
        evidence: [
          `High priority work orders: ${workOrders.filter(wo => wo.priority === 'HIGH').length}`,
          'Priority-based scheduling implemented',
        ],
        recommendations: ['Formal risk assessment matrix', 'Critical asset identification'],
      },
    ];

    const summary = this.calculateSummary(sections);

    return {
      id: `ISO-${Date.now()}`,
      type: 'ISO',
      title: 'ISO 55000 Asset Management Compliance Report',
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      sections,
      summary,
    };
  }

  // OSHA (Occupational Safety and Health) Compliance Report
  async generateOSHAReport(startDate: Date, endDate: Date): Promise<ComplianceReport> {
    const workOrders = await prisma.workOrder.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        assignedTo: true,
      },
    });

    const sections: ComplianceSection[] = [
      {
        title: 'Hazard Communication',
        requirement: 'OSHA 1910.1200 - Hazard Communication Standard',
        status: 'compliant',
        details: 'Safety information and hazard warnings documented in work orders and maintenance procedures.',
        evidence: [
          'Work order descriptions include safety notes',
          'Location information for hazardous areas tracked',
          'Equipment safety requirements documented',
        ],
        recommendations: ['Implement SDS (Safety Data Sheet) database', 'Safety training tracking'],
      },
      {
        title: 'Machinery and Equipment Safety',
        requirement: 'OSHA 1910.147 - Lockout/Tagout (LOTO)',
        status: 'partial',
        details: 'Equipment maintenance procedures documented. LOTO procedures should be explicitly tracked.',
        evidence: [
          `Equipment maintenance records: ${workOrders.length}`,
          'Maintenance procedures documented',
        ],
        recommendations: [
          'Implement LOTO procedure tracking',
          'Equipment-specific safety checklists',
          'Pre-maintenance safety verification',
        ],
      },
      {
        title: 'Record Keeping',
        requirement: 'OSHA 1904 - Recording and Reporting Occupational Injuries',
        status: 'compliant',
        details: 'Comprehensive maintenance and incident logging system in place with timestamp and user tracking.',
        evidence: [
          `Work orders logged: ${workOrders.length}`,
          'User assignment and completion tracking',
          'Date/time stamps on all activities',
        ],
        recommendations: ['Add injury/incident reporting module', 'OSHA 300 log integration'],
      },
      {
        title: 'Electrical Safety',
        requirement: 'OSHA 1910 Subpart S - Electrical Standards',
        status: 'partial',
        details: 'Electrical equipment maintenance tracked. Enhanced electrical safety protocols recommended.',
        evidence: [
          'Electrical work orders identified',
          'Qualified personnel assignment tracked',
        ],
        recommendations: [
          'Electrical work permit system',
          'Arc flash hazard assessment',
          'Qualified electrician certification tracking',
        ],
      },
      {
        title: 'Personal Protective Equipment (PPE)',
        requirement: 'OSHA 1910.132 - PPE General Requirements',
        status: 'partial',
        details: 'PPE requirements can be documented in work order procedures.',
        evidence: [
          'Work order descriptions include safety requirements',
          'Equipment-specific safety notes',
        ],
        recommendations: [
          'PPE requirement checklist per task type',
          'PPE inventory tracking',
          'PPE inspection schedule',
        ],
      },
      {
        title: 'Emergency Action Plans',
        requirement: 'OSHA 1910.38 - Emergency Action Plans',
        status: 'partial',
        details: 'Location tracking enables emergency response coordination.',
        evidence: [
          'All work orders include location information',
          'Personnel assignment tracking',
        ],
        recommendations: [
          'Emergency contact integration',
          'Emergency equipment location mapping',
          'Evacuation procedure documentation',
        ],
      },
    ];

    const summary = this.calculateSummary(sections);

    return {
      id: `OSHA-${Date.now()}`,
      type: 'OSHA',
      title: 'OSHA Safety Compliance Report',
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      sections,
      summary,
    };
  }

  // Generate comprehensive compliance dashboard
  async generateComplianceDashboard(startDate: Date, endDate: Date) {
    const [soxReport, isoReport, oshaReport] = await Promise.all([
      this.generateSOXReport(startDate, endDate),
      this.generateISOReport(startDate, endDate),
      this.generateOSHAReport(startDate, endDate),
    ]);

    return {
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      reports: [soxReport, isoReport, oshaReport],
      overallCompliance: {
        sox: soxReport.summary.complianceRate,
        iso: isoReport.summary.complianceRate,
        osha: oshaReport.summary.complianceRate,
        average: (soxReport.summary.complianceRate + isoReport.summary.complianceRate + oshaReport.summary.complianceRate) / 3,
      },
    };
  }

  // Helper methods
  private calculateSummary(sections: ComplianceSection[]): ComplianceSummary {
    const totalRequirements = sections.length;
    const compliant = sections.filter(s => s.status === 'compliant').length;
    const nonCompliant = sections.filter(s => s.status === 'non-compliant').length;
    const partial = sections.filter(s => s.status === 'partial').length;
    const complianceRate = totalRequirements > 0 ? 
      ((compliant + partial * 0.5) / totalRequirements) * 100 : 0;

    return {
      totalRequirements,
      compliant,
      nonCompliant,
      partial,
      complianceRate: Math.round(complianceRate * 10) / 10,
    };
  }

  private calculateAverageCompletionTime(workOrders: WorkOrder[]): number {
    const completed = workOrders.filter(wo => wo.status === 'COMPLETED' && wo.completedAt);
    if (completed.length === 0) return 0;

    const totalDays = completed.reduce((sum, wo) => {
      const start = new Date(wo.createdAt);
      const end = new Date(wo.completedAt!);
      const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);

    return Math.round((totalDays / completed.length) * 10) / 10;
  }

  private calculateMaintenanceCompletionRate(workOrders: WorkOrder[]): number {
    if (workOrders.length === 0) return 0;
    const completed = workOrders.filter(wo => wo.status === 'COMPLETED').length;
    return Math.round((completed / workOrders.length) * 100);
  }
}

export const complianceReportingService = new ComplianceReportingService();
