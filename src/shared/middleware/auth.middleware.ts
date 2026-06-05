import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config }    from '../../config/environment';
import { userModel } from '../../modules/user/user.repository';
import { logger }    from '../utils/loggers';
import { UnauthorizedError } from '../utils/errors';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id:                string;
        email:             string;
        role_id?:          string;
        experience_level?: string;
        first_name:        string;
        last_name:         string;
      };
    }
  }
}

export interface JWTPayload {
  userId:   string;
  email:    string;
  role_id?: string;
  iat?:     number;
  exp?:     number;
}

// ── Extract token from Authorization header ──────────────────────────────
function extractToken(req: Request): string {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }
  const token = authHeader.split(' ')[1];
  if (!token) throw new UnauthorizedError('Token missing');
  return token;
}

// ── Core authenticate middleware ─────────────────────────────────────────
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token   = extractToken(req);
    const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;

    // Fetch fresh user — needed for is_active, experience_level, names
    const user = await userModel.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Block deactivated accounts even if token is still valid
    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // id, email, role_id — trusted from signed token
    // experience_level, names — fresh from DB (can change anytime)
    req.user = {
      id:               decoded.userId,
      email:            decoded.email,
      role_id:          decoded.role_id,
      experience_level: user.experience_level,
      first_name:       user.first_name,
      last_name:        user.last_name,

    };

    next();
  } catch (error) {
    // Handle JWT-specific errors — convert to UnauthorizedError
    // TokenExpiredError must come before JsonWebTokenError (it's a subclass)
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError('Token expired'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('Invalid token'));
    }


    logger.error('Authentication error:', error);
    next(error);
  }
};

// ── Optional auth — attaches user if token present, never blocks ─────────
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next(); // no token — continue without user

  try {
    await authenticate(req, res, async (err) => {
      // If authenticate fails — log but don't block
      if (err) logger.warn('Optional auth failed:', err.message);
      next(); // always continue
    });
  } catch {
    next();
  }
};

// ── Require auth — use after optionalAuth to enforce authentication ───────
export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }
  next();
};
