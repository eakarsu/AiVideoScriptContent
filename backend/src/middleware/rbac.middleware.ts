import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { User } from '../models';

export const requireRole = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.findByPk(req.userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      if (!roles.includes((user as any).role || 'user')) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};
