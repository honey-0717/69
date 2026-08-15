import { Request, Response, NextFunction } from 'express';
import { verifySessionToken } from '../backend/src/auth';

export function enforceAdminRole(req: Request & { user?: any }, res: Response, next: NextFunction) {
  const token = req.cookies?.auth_token;
  const user = verifySessionToken(token);

  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  req.user = user;
  next();
}
