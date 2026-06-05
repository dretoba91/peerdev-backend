import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../../modules/user/role.service';
import { RoleModel } from '../../modules/user/role.repository';
import { logger } from '../utils/loggers';
import { AppError, ForbiddenError, UnauthorizedError } from "../utils/errors";

export class RBACMiddleware {
  private static roleService = new RoleService();

  // Check if user has specific role
  static requireRole(allowedRoles: string | string[]) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          return next(new UnauthorizedError("Authentication required"));
        }

        if (!req.user.role_id) {
          return next(new ForbiddenError("No role assigned to user"));
        }

        // Get user's role
        const userRole = await RoleModel.findById(req.user.role_id);
        if (!userRole) {
          return next(new ForbiddenError("Invalid user role"));
        }

        // Normalize allowed roles to array
        const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        
        // Check if user's role is in allowed roles
        const hasPermission = rolesArray.some(role => 
          role.toLowerCase() === userRole.name.toLowerCase()
        );

        if (!hasPermission) {
          return next(new ForbiddenError("Insufficient permissions"));
        }

        next();
      } catch (error) {
        logger.error('Role check error:', error);
        return next(new AppError('Permission check failed', 500));
      }
    };
  }

  // Check if user can mentor others
  static requireMentorRole() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          return next(new UnauthorizedError("Authentication required"));;
        }

        if (!req.user.role_id) {
          return next(new ForbiddenError("No role assigned to user"));
        }

        const userRole = await RoleModel.findById(req.user.role_id);
        if (!userRole) {
          return next(new ForbiddenError("Invalid user role"));
        }

        const canMentor = await RBACMiddleware.roleService.canMentor(userRole.name);
        if (!canMentor) {
          return next(new ForbiddenError("Mentor privileges required"));
        }

        next();
      } catch (error) {
        logger.error('Mentor role check error:', error);
        return next(new AppError("Permission check failed", 500));
      }
    };
  }

  // Check if user has admin privileges
  static requireAdminRole() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          return next(new UnauthorizedError("Authentication required"));
        }

        if (!req.user.role_id) {
          return next(new ForbiddenError("No role assigned to user"));
        }

        const userRole = await RoleModel.findById(req.user.role_id);
        if (!userRole) {
          return next(new ForbiddenError("Invalid user role"));
        }

        const hasAdminPrivileges = await RBACMiddleware.roleService.hasAdminPrivileges(userRole.name);
        if (!hasAdminPrivileges) {
          return next(new ForbiddenError("Admin privileges required"));
        }

        next();
      } catch (error) {
        logger.error('Admin role check error:', error);
        return next(new AppError("Permission check failed", 500));
      }
    };
  }

  // Check minimum role level
  static requireMinimumRoleLevel(minimumLevel: number) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          return next(new UnauthorizedError("Authentication required"));
        }

        if (!req.user.role_id) {
          return next(new ForbiddenError("No role assigned to user"));
        }

        const userRole = await RoleModel.findById(req.user.role_id);
        if (!userRole) {
          return next(new ForbiddenError("Invalid user role"));
        }

        const userRoleLevel = RBACMiddleware.roleService.getRoleLevel(userRole.name);
        if (userRoleLevel < minimumLevel) {
          return next(new ForbiddenError("Insufficient role level"));
        }

        next();
      } catch (error) {
        logger.error('Role level check error:', error);
        return next(new AppError("Permission check failed", 500));
      }
    };
  }

  // Check if user owns the resource or has admin privileges
  static requireOwnershipOrAdmin(userIdParam: string = 'userId') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          return next(new UnauthorizedError("Authentication required"));
        }

        const targetUserId = req.params[userIdParam]; // UUID string

        // Check if user is accessing their own resource
        if (req.user.id === targetUserId) {
          next();
          return;
        }

        // Check if user has admin privileges
        if (req.user.role_id) {
          const userRole = await RoleModel.findById(req.user.role_id);
          if (userRole) {
            const hasAdminPrivileges =
              await RBACMiddleware.roleService.hasAdminPrivileges(
                userRole.name
              );
            if (hasAdminPrivileges) {
              next();
              return;
            }
          }
        }

        return next(new ForbiddenError("Access denied. You can only access your own resources or need admin privileges."));
      } catch (error) {
        logger.error('Ownership check error:', error);
        return next(new AppError("Permission check failed", 500));
      }
    };
  }
}
