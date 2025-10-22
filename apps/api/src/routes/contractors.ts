import express from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createVendorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  isActive: z.boolean().optional(),
});

const updateVendorSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  isActive: z.boolean().optional(),
});

const createContractSchema = z.object({
  vendorId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  value: z.number().min(0),
  status: z.enum(['active', 'expired', 'terminated']).optional(),
  terms: z.any().optional(),
});

const updateContractSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  value: z.number().min(0).optional(),
  status: z.enum(['active', 'expired', 'terminated']).optional(),
  terms: z.any().optional(),
});

const createPerformanceSchema = z.object({
  vendorId: z.string(),
  workOrderId: z.string().optional(),
  rating: z.number().min(1).max(5),
  responseTime: z.number().min(0).optional(),
  quality: z.number().min(1).max(5).optional(),
  cost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// GET /api/v1/contractors/vendors - Get all vendors
router.get('/vendors', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
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
    
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;
    
    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          contracts: {
            select: {
              id: true,
              title: true,
              status: true,
              startDate: true,
              endDate: true,
              value: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
          performance: {
            select: {
              id: true,
              rating: true,
              responseTime: true,
              quality: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          _count: {
            select: {
              contracts: true,
              performance: true,
              assignments: true,
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.vendor.count({ where }),
    ]);
    
    res.json({
      data: vendors,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// GET /api/v1/contractors/vendors/:id - Get vendor by ID
router.get('/vendors/:id', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        contracts: {
          orderBy: { createdAt: 'desc' },
        },
        performance: {
          include: {
            workOrder: {
              select: {
                id: true,
                title: true,
                workOrderNumber: true,
              },
            },
            user: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        assignments: {
          include: {
            workOrder: {
              select: {
                id: true,
                title: true,
                workOrderNumber: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json({ data: vendor });
  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

// POST /api/v1/contractors/vendors - Create new vendor
router.post('/vendors', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const validatedData = createVendorSchema.parse(req.body);
    
    const vendor = await prisma.vendor.create({
      data: validatedData,
    });
    
    res.status(201).json({ data: vendor });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create vendor error:', error);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// PATCH /api/v1/contractors/vendors/:id - Update vendor
router.patch('/vendors/:id', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateVendorSchema.parse(req.body);
    
    const vendor = await prisma.vendor.update({
      where: { id },
      data: validatedData,
    });
    
    res.json({ data: vendor });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update vendor error:', error);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// DELETE /api/v1/contractors/vendors/:id - Delete vendor
router.delete('/vendors/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if vendor has active contracts
    const activeContracts = await prisma.contract.count({
      where: {
        vendorId: id,
        status: 'active',
      },
    });
    
    if (activeContracts > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete vendor with active contracts. Please terminate contracts first.' 
      });
    }
    
    await prisma.vendor.delete({
      where: { id },
    });
    
    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

// GET /api/v1/contractors/contracts - Get all contracts
router.get('/contracts', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, vendorId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (vendorId) {
      where.vendorId = vendorId;
    }
    
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;
    
    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
              contactPerson: true,
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.contract.count({ where }),
    ]);
    
    res.json({
      data: contracts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get contracts error:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// POST /api/v1/contractors/contracts - Create new contract
router.post('/contracts', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const validatedData = createContractSchema.parse(req.body);
    
    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: validatedData.vendorId },
    });
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    const contract = await prisma.contract.create({
      data: {
        ...validatedData,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    res.status(201).json({ data: contract });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create contract error:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// PATCH /api/v1/contractors/contracts/:id - Update contract
router.patch('/contracts/:id', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateContractSchema.parse(req.body);
    
    const updateData: any = { ...validatedData };
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate);
    }
    
    const contract = await prisma.contract.update({
      where: { id },
      data: updateData,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    res.json({ data: contract });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update contract error:', error);
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

// DELETE /api/v1/contractors/contracts/:id - Delete contract
router.delete('/contracts/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.contract.delete({
      where: { id },
    });
    
    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Delete contract error:', error);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

// GET /api/v1/contractors/performance - Get vendor performance
router.get('/performance', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { page = 1, limit = 10, vendorId, workOrderId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (vendorId) {
      where.vendorId = vendorId;
    }
    
    if (workOrderId) {
      where.workOrderId = workOrderId;
    }
    
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;
    
    const [performance, total] = await Promise.all([
      prisma.vendorPerformance.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          workOrder: {
            select: {
              id: true,
              title: true,
              workOrderNumber: true,
            },
          },
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.vendorPerformance.count({ where }),
    ]);
    
    res.json({
      data: performance,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

// POST /api/v1/contractors/performance - Create performance record
router.post('/performance', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const validatedData = createPerformanceSchema.parse(req.body);
    const user = req.user;
    
    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: validatedData.vendorId },
    });
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Check if work order exists (if provided)
    if (validatedData.workOrderId) {
      const workOrder = await prisma.workOrder.findUnique({
        where: { id: validatedData.workOrderId },
      });
      
      if (!workOrder) {
        return res.status(404).json({ error: 'Work order not found' });
      }
    }
    
    const performance = await prisma.vendorPerformance.create({
      data: {
        ...validatedData,
        userId: user.userId,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workOrder: {
          select: {
            id: true,
            title: true,
            workOrderNumber: true,
          },
        },
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
    
    res.status(201).json({ data: performance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create performance error:', error);
    res.status(500).json({ error: 'Failed to create performance record' });
  }
});

// GET /api/v1/contractors/analytics - Get contractor analytics
router.get('/analytics', authenticate, authorize([Role.ADMIN, Role.SUPERVISOR]), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get vendor performance summary
    const performanceSummary = await prisma.vendorPerformance.groupBy({
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
        cost: true,
      },
      _count: {
        id: true,
      },
    });
    
    // Get vendor details for summary
    const vendorIds = performanceSummary.map(p => p.vendorId);
    const vendors = await prisma.vendor.findMany({
      where: {
        id: { in: vendorIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });
    
    // Get contract statistics
    const contractStats = await prisma.contract.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      _sum: {
        value: true,
      },
    });
    
    // Get recent assignments
    const recentAssignments = await prisma.contractorAssignment.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
        workOrder: {
          select: {
            id: true,
            title: true,
            workOrderNumber: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
    
    res.json({
      data: {
        performanceSummary: performanceSummary.map(p => {
          const vendor = vendors.find(v => v.id === p.vendorId);
          return {
            vendorId: p.vendorId,
            vendorName: vendor?.name || 'Unknown',
            vendorEmail: vendor?.email || '',
            isActive: vendor?.isActive || false,
            averageRating: p._avg.rating || 0,
            averageResponseTime: p._avg.responseTime || 0,
            averageQuality: p._avg.quality || 0,
            averageCost: p._avg.cost || 0,
            totalRecords: p._count.id,
          };
        }),
        contractStats,
        recentAssignments,
        period: days,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
