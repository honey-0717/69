import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '')) {
  throw new Error('[FATAL ERROR] JWT_SECRET environment variable must be set in production.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'hotharini69_dev_secret_key_change_in_production';


export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function createSessionToken(user: AuthUser): string {
  const payload = {
    ...user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const jsonStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonStr).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): AuthUser | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [base64Payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(base64Payload)
    .digest('base64url');

  if (signature !== expectedSig) return null;

  try {
    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf8');
    const payload = JSON.parse(jsonStr);
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role || 'admin',
    };
  } catch {
    return null;
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token =
    req.cookies?.auth_token ||
    (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined);
  const user = verifySessionToken(token);

  if (!user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  req.user = user;
  next();
}
