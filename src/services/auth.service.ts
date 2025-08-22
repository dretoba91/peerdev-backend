import { config } from "../config/environment"; // Import environment variables
import { User } from "../models/user.model";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserService } from "./user.service";
import { logger } from "../utils/loggers";

export class AuthService {
  // Implement authentication service methods here

  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // register user
  async registerUser(
    userData: User
  ): Promise<Omit<User, "password"> & { access_token: string }> {
    // Implement user registration logic here
    // For example, you might call a UserService method to create a new user
    // and return the created user object and generate accesstoken as payload
    // remove the password from the user object before returning
    try {
      const createdUser = await this.userService.createUser(userData);
      const access_token = await this.generateAccessToken(createdUser);

      const userWithoutPassword = {
        id: createdUser.id,
        full_name: createdUser.full_name,
        email: createdUser.email,
        role_id: createdUser.role_id,
        experience_level: createdUser.experience_level,
        created_at: createdUser.created_at,
        updated_at: createdUser.updated_at,
      };

      return { ...userWithoutPassword, access_token };
    } catch (error) {
      logger.error("Register user error:", error);
      throw error;
    }
  }

  // login user
  async loginUser(
    email: string,
    password: string
  ): Promise<Omit<User, "password"> & { access_token: string }> {
    try {
      // Authenticate user with email and password
      const user = await this.userService.authenticateUser(email, password);
      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Generate access token
      const access_token = await this.generateAccessToken(user);

      // Return user without password and with access token
      const userWithoutPassword = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role_id: user.role_id,
        experience_level: user.experience_level,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      return { ...userWithoutPassword, access_token };
    } catch (error) {
      logger.error("Login user error:", error);
      throw error;
    }
  }

  // generate access token for user session.
  async generateAccessToken(user: User): Promise<string> {
    // Implement access token generation logic here
    // For example, you might use a library like jsonwebtoken to generate a JWT
    // and return the token as a string

    if (!user.id) {
      throw new Error("User ID is required to generate access token");
    }

    const payload = { userId: user.id, email: user.email };
    const secret = config.JWT_SECRET;
    const options: SignOptions = { expiresIn: config.JWT_EXPIRE };

    const access_token = jwt.sign(payload, secret, options);
    return access_token;
  }
}
