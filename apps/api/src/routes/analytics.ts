import express from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { emailService } from '../services/EmailService';

const router = express.Router();

// Validation schemas
const generateReportSchema = z.object({
  reportType: z.enum(['monthly', 'quarterly', 'yearly']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  format: z.enum(['pdf', 'csv', 'excel']).optional(),
  includeCharts: z.boolean().optional(),
  emailTo: z.array(z.string().email()).optional(),
});

// GET /api/v1/analytics/dashboard - Get dashboard KPIs
router.get('/dashboard', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const endDate = new Date();

    // Work Order Statistics
    const workOrderStats = await prisma.workOrder.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    });

    const totalWorkOrders = await prisma.workOrder.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const completedWorkOrders = await prisma.workOrder.count({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
        },
      },
    });

    const avgCompletionTime = await prisma.workOrder.aggregate({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: startDate,
        },
      },
      _avg: {
        estimatedDuration: true,
      },
    });

    // Priority Distribution
    const priorityStats = await prisma.workOrder.groupBy({
      by: ['priority'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // Category Performance
    const categoryStats = await prisma.workOrder.groupBy({
      by: ['categoryId'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      _avg: {
        estimatedDuration: true,
      },
    });

    // Get category names
    const categoryIds = categoryStats.map(stat => stat.categoryId).filter(Boolean);
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const categoryPerformance = categoryStats.map(stat => ({
      categoryId: stat.categoryId,
      categoryName: categories.find(c => c.id === stat.categoryId)?.name || 'Unknown',
      count: stat._count.id,
      avgDuration: stat._avg.estimatedDuration || 0,
    }));

    // Contractor Performance
    const contractorStats = await prisma.vendorPerformance.groupBy({
      by: ['vendorId'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _avg: {
        rating: true,
        responseTime: true,
        quality: true,
      },
      _count: {
        id: true,
      },
    });

    // Get vendor names
    const vendorIds = contractorStats.map(stat => stat.vendorId);
    const vendors = await prisma.vendor.findMany({
      where: {
        id: { in: vendorIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const contractorPerformance = contractorStats.map(stat => ({
      vendorId: stat.vendorId,
      vendorName: vendors.find(v => v.id === stat.vendorId)?.name || 'Unknown',
      vendorEmail: vendors.find(v => v.id === stat.vendorId)?.email || '',
      avgRating: stat._avg.rating || 0,
      avgResponseTime: stat._avg.responseTime || 0,
      avgQuality: stat._avg.quality || 0,
      totalRecords: stat._count.id,
    }));

    // SLA Performance
    const slaBreaches = await prisma.workOrder.count({
      where: {
        createdAt: {
          gte: startDate,
        },
        // Add SLA breach logic here based on your SLA rules
      },
    });

    // Recent Activity
    const recentWorkOrders = await prisma.workOrder.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            displayName: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            displayName: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Monthly Trends (last 12 months)
    const monthlyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthStats = await prisma.workOrder.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _count: {
          id: true,
        },
      });

      monthlyTrends.push({
        month: monthStart.toISOString().substring(0, 7),
        monthName: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        stats: monthStats,
        total: monthStats.reduce((sum, stat) => sum + stat._count.id, 0),
      });
    }

    res.json({
      data: {
        period: days,
        workOrderStats: {
          total: totalWorkOrders,
          completed: completedWorkOrders,
          completionRate: totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0,
          avgCompletionTime: avgCompletionTime._avg.estimatedDuration || 0,
          statusDistribution: workOrderStats,
          priorityDistribution: priorityStats,
        },
        categoryPerformance,
        contractorPerformance,
        slaBreaches,
        recentActivity: recentWorkOrders,
        monthlyTrends,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get analytics dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics dashboard' });
  }
});

// GET /api/v1/analytics/kpis - Get key performance indicators
router.get('/kpis', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Calculate KPIs
    const totalWorkOrders = await prisma.workOrder.count({
      where: {
        createdAt: { gte: startDate },
      },
    });

    const completedWorkOrders = await prisma.workOrder.count({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
    });

    const avgResponseTime = await prisma.workOrder.aggregate({
      where: {
        createdAt: { gte: startDate },
      },
      _avg: {
        estimatedDuration: true,
      },
    });

    const contractorSatisfaction = await prisma.vendorPerformance.aggregate({
      where: {
        createdAt: { gte: startDate },
      },
      _avg: {
        rating: true,
      },
    });

    const slaCompliance = await prisma.workOrder.count({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: startDate,
        },
        // Add SLA compliance logic here
      },
    });

    const totalSlaWorkOrders = await prisma.workOrder.count({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: startDate,
        },
      },
    });

    res.json({
      data: {
        period: days,
        kpis: {
          workOrderVolume: totalWorkOrders,
          completionRate: totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0,
          avgResponseTime: avgResponseTime._avg.estimatedDuration || 0,
          contractorSatisfaction: contractorSatisfaction._avg.rating || 0,
          slaCompliance: totalSlaWorkOrders > 0 ? (slaCompliance / totalSlaWorkOrders) * 100 : 0,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Get KPIs error:', error);
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
});

// POST /api/v1/analytics/reports/generate - Generate and send report
router.post('/reports/generate', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const validatedData = generateReportSchema.parse(req.body);
    const user = req.user;

    // Calculate date range
    let startDate: Date;
    let endDate: Date = new Date();

    if (validatedData.startDate && validatedData.endDate) {
      startDate = new Date(validatedData.startDate);
      endDate = new Date(validatedData.endDate);
    } else {
      startDate = new Date();
      switch (validatedData.reportType) {
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarterly':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'yearly':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
    }

    // Generate report data
    const reportData = await generateReportData(startDate, endDate);

    // Create report record
    const report = await prisma.performanceReport.create({
      data: {
        reportType: validatedData.reportType.toUpperCase(),
        startDate,
        endDate,
        generatedById: user.userId,
        data: reportData,
        format: validatedData.format || 'pdf',
        isEmailSent: false,
      },
    });

    // Generate report content
    const reportContent = generateReportContent(reportData, validatedData.reportType, startDate, endDate);

    // Send email if recipients provided
    if (validatedData.emailTo && validatedData.emailTo.length > 0) {
      try {
        await emailService.sendEmail({
          to: validatedData.emailTo,
          subject: `CMMS ${validatedData.reportType.charAt(0).toUpperCase() + validatedData.reportType.slice(1)} Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
          body: reportContent,
          isHtml: true,
        });

        // Update report as sent
        await prisma.performanceReport.update({
          where: { id: report.id },
          data: { isEmailSent: true },
        });
      } catch (emailError) {
        console.error('Failed to send report email:', emailError);
      }
    }

    res.json({
      data: {
        reportId: report.id,
        reportType: validatedData.reportType,
        startDate,
        endDate,
        format: validatedData.format || 'pdf',
        emailSent: validatedData.emailTo ? validatedData.emailTo.length > 0 : false,
        recipients: validatedData.emailTo || [],
        content: reportContent,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET /api/v1/analytics/reports - Get generated reports
router.get('/reports', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { page = 1, limit = 10, reportType, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (reportType) {
      where.reportType = reportType;
    }
    
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;
    
    const [reports, total] = await Promise.all([
      prisma.performanceReport.findMany({
        where,
        include: {
          generatedBy: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.performanceReport.count({ where }),
    ]);
    
    res.json({
      data: reports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Helper function to generate report data
async function generateReportData(startDate: Date, endDate: Date) {
  const workOrderStats = await prisma.workOrder.groupBy({
    by: ['status', 'priority'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
    _avg: {
      estimatedDuration: true,
    },
  });

  const contractorPerformance = await prisma.vendorPerformance.groupBy({
    by: ['vendorId'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _avg: {
      rating: true,
      responseTime: true,
      quality: true,
    },
    _count: {
      id: true,
    },
  });

  const categoryStats = await prisma.workOrder.groupBy({
    by: ['categoryId'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
    _avg: {
      estimatedDuration: true,
    },
  });

  return {
    workOrderStats,
    contractorPerformance,
    categoryStats,
    period: {
      startDate,
      endDate,
    },
  };
}

// Helper function to generate report content
function generateReportContent(data: any, reportType: string, startDate: Date, endDate: Date): string {
  const totalWorkOrders = data.workOrderStats.reduce((sum: number, stat: any) => sum + stat._count.id, 0);
  const completedWorkOrders = data.workOrderStats
    .filter((stat: any) => stat.status === 'COMPLETED')
    .reduce((sum: number, stat: any) => sum + stat._count.id, 0);

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">CMMS ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
          <p><strong>Period:</strong> ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}</p>
          
          <h2>Executive Summary</h2>
          <div style="background: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Total Work Orders:</strong> ${totalWorkOrders}</p>
            <p><strong>Completed Work Orders:</strong> ${completedWorkOrders}</p>
            <p><strong>Completion Rate:</strong> ${totalWorkOrders > 0 ? ((completedWorkOrders / totalWorkOrders) * 100).toFixed(1) : 0}%</p>
          </div>

          <h2>Work Order Status Distribution</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Status</th>
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Priority</th>
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Count</th>
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              ${data.workOrderStats.map((stat: any) => `
                <tr>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${stat.status}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${stat.priority}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${stat._count.id}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${stat._avg.estimatedDuration ? stat._avg.estimatedDuration.toFixed(1) : 'N/A'} hours</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Contractor Performance</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Vendor ID</th>
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Avg Rating</th>
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Avg Response Time</th>
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Avg Quality</th>
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Records</th>
              </tr>
            </thead>
            <tbody>
              ${data.contractorPerformance.map((perf: any) => `
                <tr>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${perf.vendorId}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${perf._avg.rating ? perf._avg.rating.toFixed(1) : 'N/A'}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${perf._avg.responseTime ? perf._avg.responseTime.toFixed(1) : 'N/A'} hours</td>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${perf._avg.quality ? perf._avg.quality.toFixed(1) : 'N/A'}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${perf._count.id}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Generated by COSTAATT CMMS System on ${new Date().toLocaleString()}
          </p>
        </div>
      </body>
    </html>
  `;
}

export default router;