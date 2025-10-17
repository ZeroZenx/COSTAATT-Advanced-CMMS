import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const TOKEN_EXPIRY_HOURS = parseInt(process.env.TOKEN_EXPIRY_HOURS || '12');

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  displayName: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${TOKEN_EXPIRY_HOURS}h`,
  });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}
