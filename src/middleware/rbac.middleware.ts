import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';
import { RoleModel } from '../models/role.model';
import { logger } from '../utils/loggers';

export class RBACMiddleware {
  private static roleService = new RoleService();

  // Check if user has specific role
  static requireRole(allowedRoles: string | string[]) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        if (!req.user.role_id) {
          res.status(403).json({ error: 'No role assigned to user' });
          return;
        }

        // Get user's role
        const userRole = await RoleModel.findById(req.user.role_id);
        if (!userRole) {
          res.status(403).json({ error: 'Invalid user role' });
          return;
        }

        // Normalize allowed roles to array
        const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        
        // Check if user's role is in allowed roles
        const hasPermission = rolesArray.some(role => 
          role.toLowerCase() === userRole.name.toLowerCase()
        );

        if (!hasPermission) {
          res.status(403).json({ 
            error: 'Insufficient permissions',
            required: rolesArray,
            current: userRole.name
          });
          return;
        }

        next();
      } catch (error) {
        logger.error('Role check error:', error);
        res.status(500).json({ error: 'Permission check failed' });
      }
    };
  }

  // Check if user can mentor others
  static requireMentorRole() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        if (!req.user.role_id) {
          res.status(403).json({ error: 'No role assigned to user' });
          return;
        }

        const userRole = await RoleModel.findById(req.user.role_id);
        if (!userRole) {
          res.status(403).json({ error: 'Invalid user role' });
          return;
        }

        const canMentor = await RBACMiddleware.roleService.canMentor(userRole.name);
        if (!canMentor) {
          res.status(403).json({ 
            error: 'Mentor privileges required',
            current_role: userRole.name
          });
          return;
        }

        next();
      } catch (error) {
        logger.error('Mentor role check error:', error);
        res.status(500).json({ error: 'Permission check failed' });
      }
    };
  }

  // Check if user has admin privileges
  static requireAdminRole() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        if (!req.user.role_id) {
          res.status(403).json({ error: 'No role assigned to user' });
          return;
        }

        const userRole = await RoleModel.findById(req.user.role_id);
        if (!userRole) {
          res.status(403).json({ error: 'Invalid user role' });
          return;
        }

        const hasAdminPrivileges = await RBACMiddleware.roleService.hasAdminPrivileges(userRole.name);
        if (!hasAdminPrivileges) {
          res.status(403).json({ 
            error: 'Admin privileges required',
            current_role: userRole.name
          });
          return;
        }

        next();
      } catch (error) {
        logger.error('Admin role check error:', error);
        res.status(500).json({ error: 'Permission check failed' });
      }
    };
  }

  // Check minimum role level
  static requireMinimumRoleLevel(minimumLevel: number) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        if (!req.user.role_id) {
          res.status(403).json({ error: 'No role assigned to user' });
          return;
        }

        const userRole = await RoleModel.findById(req.user.role_id);
        if (!userRole) {
          res.status(403).json({ error: 'Invalid user role' });
          return;
        }

        const userRoleLevel = RBACMiddleware.roleService.getRoleLevel(userRole.name);
        if (userRoleLevel < minimumLevel) {
          res.status(403).json({ 
            error: 'Insufficient role level',
            required_level: minimumLevel,
            current_level: userRoleLevel,
            current_role: userRole.name
          });
          return;
        }

        next();
      } catch (error) {
        logger.error('Role level check error:', error);
        res.status(500).json({ error: 'Permission check failed' });
      }
    };
  }

  // Check if user owns the resource or has admin privileges
  static requireOwnershipOrAdmin(userIdParam: string = 'userId') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: "Authentication required" });
          return;
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

        res.status(403).json({
          error:
            "Access denied. You can only access your own resources or need admin privileges.",
        });
      } catch (error) {
        logger.error('Ownership check error:', error);
        res.status(500).json({ error: 'Permission check failed' });
      }
    };
  }
}
