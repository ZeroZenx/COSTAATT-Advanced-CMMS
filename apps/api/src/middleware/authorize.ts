import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export function authorize(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
}

// Convenience middleware for specific roles
export const requireAdmin = authorize([Role.ADMIN]);
export const requireSupervisor = authorize([Role.ADMIN, Role.SUPERVISOR]);
export const requireTechnician = authorize([Role.ADMIN, Role.SUPERVISOR, Role.TECHNICIAN]);
export const requireRequestor = authorize([Role.ADMIN, Role.SUPERVISOR, Role.TECHNICIAN, Role.REQUESTOR]);
