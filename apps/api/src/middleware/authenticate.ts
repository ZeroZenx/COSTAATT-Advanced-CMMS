import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { prisma } from '../utils/prisma';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header or cookie
    let token: string | undefined;
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token
    const payload = verifyToken(token);
    
    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, displayName: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Add user to request object
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      displayName: user.displayName
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
