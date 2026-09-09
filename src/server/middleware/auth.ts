import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtAuthPayload, UserRole } from '../types/index.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'stride-hackathon-secure-jwt-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: JwtAuthPayload;
}

export function generateToken(payload: JwtAuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtAuthPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export function requireRole(allowedRoles: UserRole | UserRole[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Requires one of role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
}
