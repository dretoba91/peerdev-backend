// Export all middleware for easy importing
export { AuthMiddleware } from './auth.middleware';
export { RBACMiddleware } from './rbac.middleware';
export { ValidationMiddleware } from './validation.middleware';
export { ErrorMiddleware } from './error.middleware';

// Common middleware combinations for convenience
import { AuthMiddleware } from './auth.middleware';
import { RBACMiddleware } from './rbac.middleware';
import { ValidationMiddleware } from './validation.middleware';
import { ErrorMiddleware } from './error.middleware';

export class MiddlewareCombo {
  
  // Authentication + specific role requirement
  static authWithRole(allowedRoles: string | string[]) {
    return [
      AuthMiddleware.authenticate,
      RBACMiddleware.requireRole(allowedRoles)
    ];
  }

  // Authentication + mentor role requirement
  static authWithMentorRole() {
    return [
      AuthMiddleware.authenticate,
      RBACMiddleware.requireMentorRole()
    ];
  }

  // Authentication + admin role requirement
  static authWithAdminRole() {
    return [
      AuthMiddleware.authenticate,
      RBACMiddleware.requireAdminRole()
    ];
  }

  // Authentication + minimum role level requirement
  static authWithMinRoleLevel(minimumLevel: number) {
    return [
      AuthMiddleware.authenticate,
      RBACMiddleware.requireMinimumRoleLevel(minimumLevel)
    ];
  }

  // Authentication + ownership or admin check
  static authWithOwnershipOrAdmin(userIdParam: string = 'userId') {
    return [
      AuthMiddleware.authenticate,
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
      AuthMiddleware.authenticate,
      RBACMiddleware.requireAdminRole(),
      ValidationMiddleware.sanitizeInput(),
      ValidationMiddleware.validateRoleAssignment()
    ];
  }

  // ID validation + authentication + ownership check
  static protectedResourceAccess(idParam: string = 'id', userIdParam: string = 'userId') {
    return [
      ValidationMiddleware.validateNumericId(idParam),
      AuthMiddleware.authenticate,
      RBACMiddleware.requireOwnershipOrAdmin(userIdParam)
    ];
  }
}
