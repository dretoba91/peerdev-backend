/* The service is the business logic layer. For the User service class, we need to defne the following methods 

    - createUser(user: User): Promise<User>
    - findAllUsers(): Promise<User[]>
    - findUserById(id: number): Promise<User | null>
    - findUserByEmail(email: string): Promise<User | null>
    - updateUser(user: User): Promise<User | null>
    - deleteUser(id: number): Promise<void>

*/

import type { Role, User } from "./user.types";
import { userModel } from "./user.repository";
import { RoleService } from "./role.service";
import { logger } from "../../shared/utils/loggers";
import bcrypt from "bcryptjs";
import { ConflictError, NotFoundError } from "../../shared/utils/errors";

export class UserService {
  private roleService: RoleService;

  constructor(roleService: RoleService) {
    this.roleService = roleService;
  }

  // Consolidated method to create a new user with automatic role assignment
  async createUser(userData: Omit<User, "id">): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await userModel.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError("User with this email already exists");
      }

      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const userToCreate = {
        ...userData,
        password: hashedPassword,
      };

      // deafult role name for all users during registration is "learner"
      const defaultRole = await this.roleService.getRoleByName("learner");
      if (!defaultRole || !defaultRole.id) {
        throw new NotFoundError(
          "Default 'learner' role not found or has no ID",
        );
      }
      // I only need the role id for the learner. There is no need for array of roles anymore.
      const roleId = defaultRole.id;
      userToCreate.role_id = roleId;

      // Create the user and assign roles atomically
      const createdUser = await userModel.create(userToCreate);

      // Fetch the created user with all their roles to return
      const fetchedUser = await userModel.findById(createdUser.id!);
      if (!fetchedUser) {
        throw new NotFoundError("Failed to fetch created user");
      }
      return fetchedUser;
    } catch (error) {
      logger.error("Create user error:", error);
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
      const existingUser = await userModel.findById(user.id!);
      if (!existingUser) {
        throw new NotFoundError("User not found");
      }

      const userToUpdate = { ...existingUser, ...user };

      // Hash the password if it's being updated
      if (user.password && user.password !== existingUser.password) {
        const saltRounds = 12;
        userToUpdate.password = await bcrypt.hash(user.password, saltRounds);
      }

      await userModel.update(userToUpdate.id!, userToUpdate);

      // Fetch and return the updated user
      return await userModel.findById(userToUpdate.id!);
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
    hashedPassword: string,
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
    password: string,
  ): Promise<User | null> {
    try {
      const user = await userModel.findByEmail(email);
      if (!user) {
        return null;
      }

      const isPasswordValid = await this.verifyPassword(
        password,
        user.password,
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

  // Update a user's roles
  async updateUserRole(userId: string, roleId: string): Promise<User> {
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found`);
      }

      const role = await this.roleService.getRoleById(roleId);
      if (!role) {
        throw new NotFoundError(`Role with ID ${roleId} not found`);
      }

      await userModel.update(userId, { role_id: roleId });

      const updatedUser = await userModel.findById(userId);
      if (!updatedUser) {
        throw new NotFoundError(
          "Failed to fetch updated user after role change",
        );
      }
      return updatedUser;
    } catch (error) {
      logger.error("Update user roles error:", error);
      throw error;
    }
  }
}