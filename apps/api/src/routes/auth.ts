import express from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { hashPassword, verifyPassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = express.Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1),
  role: z.nativeEnum(Role),
  department: z.string().optional(),
  phone: z.string().optional(),
});

const updateUserSchema = z.object({
  displayName: z.string().min(1).optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    });

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    // Return user data (without password)
    res.json({
      data: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        department: user.department,
        phone: user.phone,
        token, // Also return token for client-side storage if needed
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/v1/auth/register (Admin only)
router.post('/register', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        passwordHash,
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
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET /api/v1/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
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

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// GET /api/v1/auth/users (Admin only)
router.get('/users', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
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
    });

    res.json({ data: users, total: users.length });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/v1/auth/users/:id (Admin only)
router.patch('/users/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateUserSchema.parse(req.body);

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

// DELETE /api/v1/auth/users/:id (Admin only)
router.delete('/users/:id', authenticate, authorize([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow deleting self
    if (id === req.user!.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
