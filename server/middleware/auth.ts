import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, assertEnvVar } from '../config/env';

export interface AuthPayload {
  id: string;
  role: 'master' | 'admin';
}

export function signAuthToken(payload: AuthPayload): string {
  assertEnvVar('JWT_SECRET', JWT_SECRET);
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '12h' });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    assertEnvVar('JWT_SECRET', JWT_SECRET);
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing authorization token' });
    }
    const decoded = jwt.verify(token, JWT_SECRET as string) as AuthPayload;
    (req as any).auth = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}


