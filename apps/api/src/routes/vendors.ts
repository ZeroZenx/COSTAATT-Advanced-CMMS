import express from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';

const router = express.Router();

// GET /api/v1/vendors
router.get('/', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { contactPerson: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          contracts: {
            where: { status: 'active' },
            select: { id: true, title: true, value: true, endDate: true },
          },
          performance: {
            select: { rating: true, responseTime: true, quality: true },
          },
          _count: {
            select: {
              contracts: true,
              performance: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: Number(limit),
      }),
      prisma.vendor.count({ where }),
    ]);

    // Calculate average ratings
    const vendorsWithRatings = vendors.map(vendor => {
      const avgRating = vendor.performance.length > 0
        ? vendor.performance.reduce((sum, p) => sum + p.rating, 0) / vendor.performance.length
        : 0;

      const avgResponseTime = vendor.performance.length > 0
        ? vendor.performance.reduce((sum, p) => sum + (p.responseTime || 0), 0) / vendor.performance.length
        : 0;

      const avgQuality = vendor.performance.length > 0
        ? vendor.performance.reduce((sum, p) => sum + (p.quality || 0), 0) / vendor.performance.length
        : 0;

      return {
        ...vendor,
        avgRating: Math.round(avgRating * 10) / 10,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        avgQuality: Math.round(avgQuality * 10) / 10,
      };
    });

    res.json({
      data: vendorsWithRatings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// GET /api/v1/vendors/:id
router.get('/:id', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        contracts: {
          orderBy: { startDate: 'desc' },
        },
        performance: {
          include: {
            workOrder: {
              select: { id: true, title: true, status: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Calculate performance metrics
    const performance = vendor.performance;
    const avgRating = performance.length > 0
      ? performance.reduce((sum, p) => sum + p.rating, 0) / performance.length
      : 0;

    const avgResponseTime = performance.length > 0
      ? performance.reduce((sum, p) => sum + (p.responseTime || 0), 0) / performance.length
      : 0;

    const avgQuality = performance.length > 0
      ? performance.reduce((sum, p) => sum + (p.quality || 0), 0) / performance.length
      : 0;

    const totalValue = vendor.contracts.reduce((sum, c) => sum + Number(c.value), 0);
    const activeContracts = vendor.contracts.filter(c => c.status === 'active').length;

    res.json({
      data: {
        ...vendor,
        performanceMetrics: {
          avgRating: Math.round(avgRating * 10) / 10,
          avgResponseTime: Math.round(avgResponseTime * 10) / 10,
          avgQuality: Math.round(avgQuality * 10) / 10,
          totalContracts: vendor.contracts.length,
          activeContracts,
          totalValue,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

// POST /api/v1/vendors
router.post('/', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { name, email, phone, address, contactPerson } = req.body;

    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        phone,
        address,
        contactPerson,
      },
    });

    res.status(201).json({ data: vendor });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// PUT /api/v1/vendors/:id
router.put('/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, contactPerson, isActive } = req.body;

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        contactPerson,
        isActive,
      },
    });

    res.json({ data: vendor });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// DELETE /api/v1/vendors/:id
router.delete('/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.vendor.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

// GET /api/v1/vendors/:id/contracts
router.get('/:id/contracts', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const where: any = { vendorId: id };
    if (status) {
      where.status = status;
    }

    const contracts = await prisma.contract.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });

    res.json({ data: contracts });
  } catch (error) {
    console.error('Error fetching vendor contracts:', error);
    res.status(500).json({ error: 'Failed to fetch vendor contracts' });
  }
});

// POST /api/v1/vendors/:id/contracts
router.post('/:id/contracts', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, value, terms } = req.body;

    const contract = await prisma.contract.create({
      data: {
        vendorId: id,
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        value,
        terms,
        status: 'active',
      },
    });

    res.status(201).json({ data: contract });
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// GET /api/v1/vendors/:id/performance
router.get('/:id/performance', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30' } = req.query;
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const performance = await prisma.vendorPerformance.findMany({
      where: {
        vendorId: id,
        createdAt: { gte: startDate },
      },
      include: {
        workOrder: {
          select: { id: true, title: true, status: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate metrics
    const metrics = {
      totalRatings: performance.length,
      avgRating: performance.length > 0
        ? performance.reduce((sum, p) => sum + p.rating, 0) / performance.length
        : 0,
      avgResponseTime: performance.length > 0
        ? performance.reduce((sum, p) => sum + (p.responseTime || 0), 0) / performance.length
        : 0,
      avgQuality: performance.length > 0
        ? performance.reduce((sum, p) => sum + (p.quality || 0), 0) / performance.length
        : 0,
      totalCost: performance.reduce((sum, p) => sum + Number(p.cost || 0), 0),
    };

    res.json({
      data: performance,
      metrics,
    });
  } catch (error) {
    console.error('Error fetching vendor performance:', error);
    res.status(500).json({ error: 'Failed to fetch vendor performance' });
  }
});

// POST /api/v1/vendors/:id/performance
router.post('/:id/performance', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { id } = req.params;
    const { workOrderId, rating, responseTime, quality, cost, notes } = req.body;

    const performance = await prisma.vendorPerformance.create({
      data: {
        vendorId: id,
        workOrderId,
        rating,
        responseTime,
        quality,
        cost,
        notes,
      },
    });

    // Update vendor average rating
    const vendorPerformance = await prisma.vendorPerformance.findMany({
      where: { vendorId: id },
      select: { rating: true },
    });

    const avgRating = vendorPerformance.reduce((sum, p) => sum + p.rating, 0) / vendorPerformance.length;

    await prisma.vendor.update({
      where: { id },
      data: { rating: avgRating },
    });

    res.status(201).json({ data: performance });
  } catch (error) {
    console.error('Error creating vendor performance:', error);
    res.status(500).json({ error: 'Failed to create vendor performance' });
  }
});

// GET /api/v1/vendors/analytics/overview
router.get('/analytics/overview', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const totalVendors = await prisma.vendor.count();
    const activeVendors = await prisma.vendor.count({ where: { isActive: true } });
    const totalContracts = await prisma.contract.count();
    const activeContracts = await prisma.contract.count({ where: { status: 'active' } });
    const totalContractValue = await prisma.contract.aggregate({
      _sum: { value: true },
    });

    // Top performing vendors
    const topVendors = await prisma.vendor.findMany({
      where: { isActive: true },
      include: {
        performance: {
          select: { rating: true },
        },
      },
      orderBy: { rating: 'desc' },
      take: 5,
    });

    // Recent performance entries
    const recentPerformance = await prisma.vendorPerformance.findMany({
      include: {
        vendor: { select: { name: true } },
        workOrder: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      data: {
        summary: {
          totalVendors,
          activeVendors,
          totalContracts,
          activeContracts,
          totalContractValue: totalContractValue._sum.value || 0,
        },
        topVendors: topVendors.map(v => ({
          id: v.id,
          name: v.name,
          rating: v.rating,
          performanceCount: v.performance.length,
        })),
        recentPerformance,
      },
    });
  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    res.status(500).json({ error: 'Failed to fetch vendor analytics' });
  }
});

export default router;
