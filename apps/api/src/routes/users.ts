import express from 'express';
import { prisma } from '../utils/prisma';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2),
  role: z.nativeEnum(Role),
  department: z.string().optional(),
  phone: z.string().optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  displayName: z.string().min(2).optional(),
  role: z.nativeEnum(Role).optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/v1/users - Get all users (Admin only)
router.get('/', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, department, isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { displayName: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (department) {
      where.department = department;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          department: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/v1/users/:id - Get user by ID (Admin only)
router.get('/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        department: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/v1/users - Create new user (Admin only)
router.post('/', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        department: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({ data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PATCH /api/v1/users/:id - Update user (Admin only)
router.patch('/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateUserSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and if it already exists
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        department: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({ data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/v1/users/:id - Delete user (Admin only)
router.delete('/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting the last admin
    if (existingUser.role === Role.ADMIN) {
      const adminCount = await prisma.user.count({
        where: { role: Role.ADMIN },
      });

      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// PATCH /api/v1/users/:id/toggle-status - Toggle user active status (Admin only)
router.patch('/:id/toggle-status', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deactivating the last admin
    if (user.role === Role.ADMIN && user.isActive) {
      const activeAdminCount = await prisma.user.count({
        where: { role: Role.ADMIN, isActive: true },
      });

      if (activeAdminCount <= 1) {
        return res.status(400).json({ error: 'Cannot deactivate the last active admin user' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        department: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({ data: updatedUser });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// GET /api/v1/users/stats - Get user statistics (Admin only)
router.get('/stats', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      usersByRole,
      recentUsers,
      usersByDepartment,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.user.groupBy({
        by: ['department'],
        _count: { department: true },
        where: { department: { not: null } },
      }),
    ]);

    res.json({
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: usersByRole,
        recent: recentUsers,
        byDepartment: usersByDepartment,
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

export default router;
