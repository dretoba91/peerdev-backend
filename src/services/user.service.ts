/* The service is the business logic layer. For the User service class, we need to defne the following methods 

    - createUser(user: User): Promise<User>
    - findAllUsers(): Promise<User[]>
    - findUserById(id: number): Promise<User | null>
    - findUserByEmail(email: string): Promise<User | null>
    - updateUser(user: User): Promise<User | null>
    - deleteUser(id: number): Promise<void>

*/

import { User, userModel } from "../models/user.model";
import { RoleModel } from "../models/role.model";
import { RoleService } from "./role.service";
import { logger } from "../utils/loggers";
import bcrypt from "bcryptjs";

export class UserService {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  // Create user method with role type
  async createUser(user: User, roleType?: string): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await userModel.findByEmail(user.email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash the password before saving to database
      const saltRounds = 12;
      user.password = await bcrypt.hash(user.password, saltRounds);

      // Set role_id based on roleType or default to 'developer'
      if (roleType) {
        const roleId = await this.roleService.getRoleIdByName(roleType);
        if (!roleId) {
          throw new Error(`Invalid role type: ${roleType}`);
        }
        user.role_id = roleId;
      } else if (!user.role_id) {
        // Default to 'developer' role if no role specified
        const defaultRoleId = await this.roleService.getRoleIdByName(
          "developer"
        );
        user.role_id = defaultRoleId;
      }

      await userModel.create(user);
      // For UUID primary keys, we need to get the created user by email since we don't have insertId
      const createdUser = await userModel.findByEmail(user.email);
      if (!createdUser) {
        throw new Error("Failed to create user");
      }
      return createdUser;
    } catch (error) {
      logger.error("Create user error:", error);
      throw error;
    }
  }

  // Create user with specific role type (more explicit approach)
  async createUserWithRole(
    userData: Omit<User, "role_id">,
    roleType: string
  ): Promise<User> {
    try {
      // Validate role type exists
      const roleId = await this.roleService.getRoleIdByName(roleType);
      if (!roleId) {
        throw new Error(
          `Invalid role type: ${roleType}. Available roles: developer, mentor, moderator, event_organizer, content_creator, admin, super_admin`
        );
      }

      // Create user object with role_id
      const userWithRole: User = {
        ...userData,
        role_id: roleId,
      };

      return await this.createUser(userWithRole);
    } catch (error) {
      logger.error("Create user with role error:", error);
      throw error;
    }
  }

  // Create user with intelligent role assignment based on experience level
  async createUserWithExperienceBasedRole(
    userData: Omit<User, "role_id">,
    experienceLevel: string
  ): Promise<User> {
    try {
      // Get suggested role based on experience level
      const suggestedRole =
        this.roleService.getSuggestedRoleByExperience(experienceLevel);
      const roleId = await this.roleService.getRoleIdByName(suggestedRole);

      if (!roleId) {
        throw new Error(
          `Failed to assign role for experience level: ${experienceLevel}`
        );
      }

      // Create user object with auto-assigned role
      const userWithRole: User = {
        ...userData,
        role_id: roleId,
      };

      return await this.createUser(userWithRole);
    } catch (error) {
      logger.error("Create user with experience-based role error:", error);
      throw error;
    }
  }

  // Find all users

  async findAllUsers(): Promise<User[]> {
    try {
      const users = await userModel.findAll();
      return users as User[];
    } catch (error) {
      logger.error("Find all users error:", error);
      throw error;
    }
  }

  // Find user by id
  async findUserById(id: string): Promise<User | null> {
    try {
      const user = await userModel.findById(id);
      return user;
    } catch (error) {
      logger.error("Find user by id error:", error);
      throw error;
    }
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await userModel.findByEmail(email);
      return user;
    } catch (error) {
      logger.error("Find user by email error:", error);
      throw error;
    }
  }

  // Update user
  async updateUser(user: User): Promise<User | null> {
    try {
      // Hash the password if it's being updated
      if (user.password) {
        const saltRounds = 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }

      await userModel.updateUser(user);
      return user;
    } catch (error) {
      logger.error("Update user error:", error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    try {
      await userModel.deleteUser(id);
    } catch (error) {
      logger.error("Delete user error:", error);
      throw error;
    }
  }

  // Verify password for login
  async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      logger.error("Password verification error:", error);
      throw error;
    }
  }

  // Authenticate user with email and password
  async authenticateUser(
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      const user = await userModel.findByEmail(email);
      if (!user) {
        return null;
      }

      const isPasswordValid = await this.verifyPassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      logger.error("User authentication error:", error);
      throw error;
    }
  }

  // Update user role
  async updateUserRole(userId: string, roleType: string): Promise<User> {
    try {
      // First, fetch the user to validate they exist and get current details
      const existingUser = await userModel.findById(userId);
      if (!existingUser) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Get the new role ID
      const newRoleId = await this.roleService.getRoleIdByName(roleType);
      if (!newRoleId) {
        throw new Error(`Invalid role type: ${roleType}`);
      }

      // Optional: Get current role name for logging
      let currentRoleName = "unknown";
      if (existingUser.role_id) {
        const currentRole = await RoleModel.findById(existingUser.role_id);
        currentRoleName = currentRole?.name || "unknown";
      }

      // Update the role
      await userModel.updateRole(userId, newRoleId);

      // Fetch and return the updated user
      const updatedUser = await userModel.findById(userId);
      if (!updatedUser) {
        throw new Error("Failed to fetch updated user");
      }

      logger.info(
        `User role updated: ${existingUser.email} changed from '${currentRoleName}' to '${roleType}'`
      );
      return updatedUser;
    } catch (error) {
      logger.error("Update user role error:", error);
      throw error;
    }
  }
}
