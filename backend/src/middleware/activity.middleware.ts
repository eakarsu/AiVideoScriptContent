import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import ActivityLog from '../models/ActivityLog';

export const logActivity = (action: string, resource: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Store original json method to intercept response
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      // Log activity after successful response
      if (res.statusCode < 400 && req.userId) {
        const resourceId = body?.id || req.params?.id ? parseInt(req.params.id) : null;
        ActivityLog.create({
          userId: req.userId,
          action,
          resource,
          resourceId: resourceId || null,
          details: JSON.stringify({ method: req.method, path: req.path }),
          ipAddress: req.ip || req.socket.remoteAddress || null,
        }).catch((err) => console.error('Activity log error:', err));
      }
      return originalJson(body);
    };

    next();
  };
};
