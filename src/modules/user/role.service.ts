import type { Role } from "./user.types";
import { RoleModel } from "./role.repository";
import { logger } from "../../shared/utils/loggers";

/**
 * Role Name:
 * learner - default role for users who want to acquire new skills
 * mentor - experienced individuals who can guide and teach others
 * content_contributor - creates educational content and tutorials
 * event_host - organizes peer learning sessions and events
 * moderator - can moderate content and discussions
 * administrator - manages users and platform settings
 * super_admin - has all permissions including managing administrators
 *
 * Experience Level to Role Mapping:
 * Note: Everyone is a learner by default.
 * The 'mentor' role is auto-assigned to senior-level users.
 * beginner, junior, mid_level -> learner
 * senior, lead, manager, principal, architect -> learner, mentor
 */

export class RoleService {
  // Get role by name
  async getRoleByName(roleName: string): Promise<Role | null> {
    try {
      return await RoleModel.findByName(roleName.toLowerCase());
    } catch (error) {
      logger.error("Get role by name error:", error);
      throw error;
    }
  }

  // Get role ID by name
  async getRoleIdByName(roleName: string): Promise<string | null> {
    try {
      const role = await this.getRoleByName(roleName);
      return role ? role.id! : null;
    } catch (error) {
      logger.error("Get role ID error:", error);
      throw error;
    }
  }

  // Get role by ID
  async getRoleById(roleId: string): Promise<Role | null> {
    try {
      return await RoleModel.findById(roleId);
    } catch (error) {
      logger.error("Get role by ID error:", error);
      throw error;
    }
  }

  // Get all available roles
  async getAllRoles(): Promise<Role[]> {
    try {
      return (await RoleModel.findAll()) as Role[];
    } catch (error) {
      logger.error("Get all roles error:", error);
      throw error;
    }
  }

  // Validate if role exists
  async validateRole(roleName: string): Promise<boolean> {
    try {
      const role = await this.getRoleByName(roleName);
      return role !== null;
    } catch (error) {
      logger.error("Validate role error:", error);
      return false;
    }
  }

  // Get suggested role based on experience level
  getSuggestedRolesByExperience(experienceLevel: string): string[] {
    const roles = ["learner"]; // Everyone is a learner by default
    switch (experienceLevel.toLowerCase()) {
      case "senior":
      case "lead":
      case "manager":
      case "principal":
      case "architect":
        roles.push("mentor"); // Add 'mentor' role for experienced users
        break;
      default:
        // No additional roles for beginner, junior, mid_level
        break;
    }
    return roles;
  }

  // Check if role can mentor others
  // Supports a single role name or an array of role names
  async canMentor(roles: string | string[]): Promise<boolean> {
    const normalizedRoles = Array.isArray(roles) ? roles : [roles];
    return normalizedRoles.includes("mentor");
  }

  // Check if role has admin privileges
  async hasAdminPrivileges(roles: string | string[]): Promise<boolean> {
    const normalizedRoles = Array.isArray(roles) ? roles : [roles];
    const adminRoles = ["administrator", "super_admin"];
    return normalizedRoles.some((role) => adminRoles.includes(role));
  }

  // Get role hierarchy level (useful for permissions)
  // The role levels should be updated to match the new roles
  getRoleLevel(roleName: string): number {
    const roleLevels: { [key: string]: number } = {
      learner: 1,
      content_contributor: 2,
      event_host: 2,
      moderator: 3,
      mentor: 4,
      administrator: 5,
      super_admin: 6,
    };
    return roleLevels[roleName.toLowerCase()] || 0;
  }

  // Create new role (admin function)
  async createRole(roleData: Omit<Role, "id">): Promise<Role> {
    try {
      // Check if role already exists
      const existingRole = await this.getRoleByName(roleData.name);
      if (existingRole) {
        throw new Error(`Role '${roleData.name}' already exists`);
      }

      await RoleModel.create(roleData);
      // For UUID primary keys, we need to get the created role by name since we don't have insertId
      const createdRole = await this.getRoleByName(roleData.name);

      if (!createdRole) {
        throw new Error("Failed to create role");
      }

      logger.info(`New role created: ${roleData.name}`);
      return createdRole;
    } catch (error) {
      logger.error("Create role error:", error);
      throw error;
    }
  }
}
