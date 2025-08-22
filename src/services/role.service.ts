import { Role, RoleModel } from "../models/role.model";
import { logger } from "../utils/loggers";

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
  getSuggestedRoleByExperience(experienceLevel: string): string {
    switch (experienceLevel.toLowerCase()) {
      case "beginner":
      case "junior":
        return "developer"; // Learners who need help
      case "mid_level":
        return "developer"; // Can be both learner and helper
      case "senior":
      case "lead":
        return "mentor"; // Experienced enough to mentor others
      case "manager":
      case "principal":
      case "architect":
        return "mentor"; // Senior roles that can guide others
      default:
        return "developer"; // Default fallback
    }
  }

  // Check if role can mentor others
  async canMentor(roleName: string): Promise<boolean> {
    const mentorRoles = ["mentor", "admin", "super_admin"];
    return mentorRoles.includes(roleName.toLowerCase());
  }

  // Check if role has admin privileges
  async hasAdminPrivileges(roleName: string): Promise<boolean> {
    const adminRoles = ["admin", "super_admin"];
    return adminRoles.includes(roleName.toLowerCase());
  }

  // Get role hierarchy level (useful for permissions)
  getRoleLevel(roleName: string): number {
    const roleLevels: { [key: string]: number } = {
      developer: 1,
      mentor: 2,
      moderator: 3,
      event_organizer: 2,
      content_creator: 2,
      admin: 4,
      super_admin: 5,
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