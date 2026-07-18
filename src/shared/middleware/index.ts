// Export all middleware for easy importing
export { RBACMiddleware } from './rbac.middleware';
export { ValidationMiddleware } from './validation.middleware';

// Common middleware combinations for convenience
import { RBACMiddleware } from './rbac.middleware';
import { ValidationMiddleware } from './validation.middleware';
import { authenticate } from './auth.middleware';

export class MiddlewareCombo {
  
  // Authentication + specific role requirement
  static authWithRole(allowedRoles: string | string[]) {
    return [
      authenticate,
      RBACMiddleware.requireRole(allowedRoles)
    ];
  }

  // Authentication + mentor role requirement
  static authWithMentorRole() {
    return [
      authenticate,
      RBACMiddleware.requireMentorRole()
    ];
  }

  // Authentication + admin role requirement
  static authWithAdminRole() {
    return [
      authenticate,
      RBACMiddleware.requireAdminRole()
    ];
  }

  // Authentication + minimum role level requirement
  static authWithMinRoleLevel(minimumLevel: number) {
    return [
      authenticate,
      RBACMiddleware.requireMinimumRoleLevel(minimumLevel)
    ];
  }

  // Authentication + ownership or admin check
  static authWithOwnershipOrAdmin(userIdParam: string = 'userId') {
    return [
      authenticate,
      RBACMiddleware.requireOwnershipOrAdmin(userIdParam)
    ];
  }

  // Full user registration validation chain
  static userRegistrationChain() {
    return [
      ValidationMiddleware.sanitizeInput(),
      ValidationMiddleware.validateUserRegistration()
    ];
  }

  // Full user login validation chain
  static userLoginChain() {
    return [
      ValidationMiddleware.sanitizeInput(),
      ValidationMiddleware.validateUserLogin()
    ];
  }

  // Role assignment validation chain (admin only)
  static roleAssignmentChain() {
    return [
      authenticate,
      RBACMiddleware.requireAdminRole(),
      ValidationMiddleware.sanitizeInput(),
      ValidationMiddleware.validateRoleAssignment()
    ];
  }

  // ID validation + authentication + ownership check
  static protectedResourceAccess(idParam: string = 'id', userIdParam: string = 'userId') {
    return [
      ValidationMiddleware.validateNumericId(idParam),
      authenticate,
      RBACMiddleware.requireOwnershipOrAdmin(userIdParam)
    ];
  }
}
