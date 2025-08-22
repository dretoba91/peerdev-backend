import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/user.model';
import { logger } from '../utils/loggers';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string; // UUID
        email: string;
        role_id?: string; // UUID
        experience_level?: string;
        full_name: string;
      };
    }
  }
}

export interface JWTPayload {
  userId: string; // UUID
  email: string;
  role_id?: string; // UUID
  iat?: number;
  exp?: number;
}

export class AuthMiddleware {
  
  // Verify JWT token and attach user to request
  static async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(401).json({ error: 'Authorization header missing' });
        return;
      }

      const token = authHeader.split(' ')[1]; // Bearer <token>
      
      if (!token) {
        res.status(401).json({ error: 'Token missing' });
        return;
      }

      // Verify JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        logger.error('JWT_SECRET not configured');
        res.status(500).json({ error: 'Server configuration error' });
        return;
      }

      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
      
      // Fetch fresh user data from database
      const user = await userModel.findById(decoded.userId);
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      // Attach user to request object
      req.user = {
        id: user.id!,
        email: user.email,
        role_id: user.role_id || undefined,
        experience_level: user.experience_level,
        full_name: user.full_name
      };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: 'Token expired' });
        return;
      }
      
      logger.error('Authentication error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  // Optional authentication - doesn't fail if no token provided
  static async optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        next();
        return;
      }

      // If header exists, try to authenticate
      await AuthMiddleware.authenticate(req, res, next);
    } catch (error) {
      // If authentication fails, continue without user
      logger.warn('Optional authentication failed:', error);
      next();
    }
  }

  // Check if user is authenticated (helper for other middleware)
  static requireAuth(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    next();
  }
}
