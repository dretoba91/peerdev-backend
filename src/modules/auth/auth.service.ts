import { config } from "../../config/environment";
import type { User } from "../user/user.types";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserService } from "../user/user.service";
import { logger } from "../../shared/utils/loggers";
import { AuthUserResponse, MessageResponse, RefreshTokenResponse } from "./auth.types";
import otpService from "../../shared/services/otp.service";
import { userModel } from "../user/user.repository";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../shared/utils/errors";


export class AuthService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Register a new user
  async registerUser(userData: User): Promise<MessageResponse> {
    try {
      const createdUser = await this.userService.createUser(userData);
      // Generate OTP and store in Redis (10 min TTL)
      const otp = await otpService.generateAndStore(createdUser.id!);

      // TODO: replace with real email/SMS service
      logger.info(`[DEV ONLY] OTP for ${createdUser.email}: ${otp}`);
      return { message: 'Registration successful. Please verify your email.' };
    } catch (error) {
      logger.error("Register user error:", error);
      throw error;
    }
  }

  // Verify OTP code for a user
  async verifyOTP(userId: string, code: string): Promise<AuthUserResponse> {
    try {
      // validate OTP against Redis
      const isValid = await otpService.verify(userId, code);
      if (!isValid) {
        throw new UnauthorizedError('Invalid or expired OTP');
      }

      // If valid, you can proceed with whatever logic you need (e.g. mark user as verified)
      // mark email as verified in database
      await userModel.update(userId, {email_verified: true});

      // fetch updated user
      const user = await userModel.findById(userId);
      if (!user) throw new Error("User not found");

      // Issue access token
      const access_token = await this.generateAccessToken(user);
      const refresh_token = await this.generateRefreshToken(user);
      await this.saveRefreshToken(user.id!, refresh_token);

      // Strip sensitive fields
      const { password, verification_token,
              verification_token_expires, refresh_token: _refresh_token, ...safeUser } = user;

      return { user: safeUser, access_token, refresh_token } as AuthUserResponse;
    } catch (error) {
      logger.error("Verify OTP error:", error);
      throw error;
    }
  }

  // RESEND OTP — for unverified users who never got or lost their code
  async resendOtp(email: string): Promise<MessageResponse> {
    try {
      const user = await userModel.findByEmail(email);
      if (!user) throw new NotFoundError('User not found');

      // Already verified — no need for a new OTP
      if (user.email_verified) {
        throw new BadRequestError('Email is already verified');
      }

      // Invalidate old OTP if it exists, then generate a fresh one
      await otpService.invalidate(user.id!);
      const otp = await otpService.generateAndStore(user.id!);

      // TODO: replace with real email/SMS service
      logger.info(`[DEV ONLY] Resent OTP for ${user.email}: ${otp}`);

      return { message: 'A new verification code has been sent.' };
    } catch (error) {
      logger.error('Resend OTP error:', error);
      throw error;
    }
  }

  // Log in a user
  async loginUser(email: string, password: string): Promise<AuthUserResponse> {
    try {
      const user = await this.userService.authenticateUser(email, password);
      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Block login if email not verified
      if (!user.email_verified) {
        throw new UnauthorizedError('Please verify your email before logging in');
      }

      const access_token = await this.generateAccessToken(user);
      const refresh_token = await this.generateRefreshToken(user);
      await this.saveRefreshToken(user.id!, refresh_token);

      // Destructure the user object to omit the password
      const { password: _password, verification_token,
              verification_token_expires, refresh_token: _refresh_token, ...safeUser } = user;

      return { user: safeUser, access_token, refresh_token };
    } catch (error) {
      logger.error("Login user error:", error);
      throw error;
    }
  }

  // Generate an access token for a user session
  async generateAccessToken(user: User): Promise<string> {
    if (!user.id) {
      throw new Error("User ID is required to generate access token");
    }

    // const roles = user.roles || [];

    const payload  = { userId: user.id, email: user.email, role_id: user.role_id };
    const secret = config.JWT_SECRET;
    const options: SignOptions = { expiresIn: config.JWT_EXPIRE };

    const access_token = jwt.sign(payload, secret, options);
    return access_token;
  }

  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const saltRounds = 12;
    const hashedToken = await bcrypt.hash(refreshToken, saltRounds);
    await userModel.update(userId, { refresh_token: hashedToken });
  }

  async logoutUser(userId: string, refreshToken?: string): Promise<MessageResponse> {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (refreshToken && user.refresh_token) {
      const tokenMatches = await bcrypt.compare(refreshToken, user.refresh_token);
      if (!tokenMatches) {
        throw new UnauthorizedError('Invalid refresh token');
      }
    }

    await userModel.update(userId, { refresh_token: null });
    return { message: 'Logged out successfully' };
  }

  async refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    let payload: { userId?: string };
    try {
      payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { userId?: string };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const userId = payload.userId;
    if (!userId) {
      throw new UnauthorizedError('Refresh token payload missing userId');
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.refresh_token) {
      throw new UnauthorizedError('Refresh token not stored for this user');
    }

    const tokenMatches = await bcrypt.compare(refreshToken, user.refresh_token);
    if (!tokenMatches) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const access_token = await this.generateAccessToken(user);
    return { access_token };
  }

  // Generate a refresh token for a user session
  async generateRefreshToken(user: User): Promise<string> {
    const payload = { userId: user.id };
    const secret = config.JWT_REFRESH_SECRET;

    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }
}
