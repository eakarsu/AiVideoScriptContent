import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
}

interface JwtPayload {
  userId: number;
  email: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || '';
    if (secret.length < 32) {
      res.status(503).json({ error: 'Secure JWT configuration required' });
      return;
    }

    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] }) as JwtPayload;

    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const generateToken = (userId: number, email: string): string => {
  const secret = process.env.JWT_SECRET || '';
  if (secret.length < 32 || !process.env.GOVERNANCE_TENANT_ID) throw new Error('Secure JWT and tenant configuration required');
  return jwt.sign({ sub: String(userId), userId, email, role: 'creator', tenantId: process.env.GOVERNANCE_TENANT_ID, subjectIds: [`creator:${userId}`] }, secret, { algorithm: 'HS256', expiresIn: '24h' });
};
