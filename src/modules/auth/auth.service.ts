import { config } from "../../config/environment";
import type { User } from "../user/user.types";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserService } from "../user/user.service";
import { logger } from "../../shared/utils/loggers";
import { AuthUserResponse, RefreshTokenResponse } from "./auth.types";
import otpService from "../../shared/services/otp.service";
import { userModel } from "../user/user.repository";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../shared/utils/errors";
import { sessionRepository } from "./session.repository";
import { v4 as uuidv4 } from "uuid";
import { detectLoginAnomaly } from "../../shared/utils/anomalyDetector";
import { MessageResponse } from "../../shared/utils/response";

export class AuthService {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  // Register a new user
  async registerUser(userData: User): Promise<MessageResponse> {
    try {
      const createdUser = await this.userService.createUser(userData);
      // Generate OTP and store in Redis (10 min TTL)
      const otp = await otpService.generateAndStore(createdUser.id!);

      // TODO: replace with real email/SMS service
      logger.info(`[DEV ONLY] OTP for ${createdUser.email}: ${otp}`);
      return { message: "Registration successful. Please verify your email." };
    } catch (error) {
      logger.error("Register user error:", error);
      throw error;
    }
  }

  // Verify OTP code for a user
  async verifyOTP(
    userId: string,
    code: string,
    device_id: string | undefined,
    ip_address: string,
  ): Promise<AuthUserResponse> {
    try {
      // validate OTP against Redis
      const isValid = await otpService.verify(userId, code);
      if (!isValid) {
        throw new UnauthorizedError("Invalid or expired OTP");
      }

      // If valid, you can proceed with whatever logic you need (e.g. mark user as verified)
      // mark email as verified in database
      await userModel.update(userId, { email_verified: true });

      // fetch updated user
      const user = await userModel.findById(userId);
      if (!user) throw new NotFoundError("User not found");

      // Issue access token
      const access_token = await this.generateAccessToken(user);

      // Create session first to get session_id
      const session_id = uuidv4();

      // Generate refresh token with session_id in payload
      const refresh_token = await this.generateRefreshToken(user, session_id);
      const hashedRefreshToken = await bcrypt.hash(refresh_token, 12);

      await sessionRepository.createSession({
        user_id: user.id!,
        refresh_token: hashedRefreshToken,
        id: session_id,
        device_id,
        ip_address,
      });

      // Strip sensitive fields
      const {
        password,
        verification_token,
        verification_token_expires,
        ...safeUser
      } = user;

      return {
        user: safeUser,
        access_token,
        refresh_token,
        session_id,
      } as AuthUserResponse;
    } catch (error) {
      logger.error("Verify OTP error:", error);
      throw error;
    }
  }

  // RESEND OTP — for unverified users who never got or lost their code
  async resendOtp(email: string): Promise<MessageResponse> {
    try {
      const user = await userModel.findByEmail(email);
      if (!user) throw new NotFoundError("User not found");

      // Already verified — no need for a new OTP
      if (user.email_verified) {
        throw new BadRequestError("Email is already verified");
      }

      // Invalidate old OTP if it exists, then generate a fresh one
      await otpService.invalidate(user.id!);
      const otp = await otpService.generateAndStore(user.id!);

      // TODO: replace with real email/SMS service
      logger.info(`[DEV ONLY] Resent OTP for ${user.email}: ${otp}`);

      return { message: "A new verification code has been sent." };
    } catch (error) {
      logger.error("Resend OTP error:", error);
      throw error;
    }
  }

  // Log in a user
  async loginUser(
    email: string,
    password: string,
    device_id: string | undefined,
    ip_address: string,
  ): Promise<AuthUserResponse> {
    try {
      const user = await this.userService.authenticateUser(email, password);
      if (!user) {
        throw new UnauthorizedError("Invalid email or password");
      }

      // Block login if email not verified
      if (!user.email_verified) {
        throw new UnauthorizedError(
          "Please verify your email before logging in",
        );
      }

      const access_token = await this.generateAccessToken(user);

      // detect login anomaly
      await detectLoginAnomaly(user.id!, ip_address, device_id || "");

      // Create session_id
      const session_id = uuidv4();

      // Generate refresh token with session_id in payload
      const refresh_token = await this.generateRefreshToken(user, session_id);
      const hashedRefreshToken = await bcrypt.hash(refresh_token, 12);

      // create session with hashed refresh token
      await sessionRepository.createSession({
        user_id: user.id!,
        refresh_token: hashedRefreshToken,
        id: session_id,
        device_id,
        ip_address,
      });

      // Destructure the user object to omit the password
      const {
        password: _password,
        verification_token,
        verification_token_expires,
        ...safeUser
      } = user;

      return { user: safeUser, access_token, refresh_token, session_id };
    } catch (error) {
      logger.error("Login user error:", error);
      throw error;
    }
  }

  // Generate an access token for a user session
  private async generateAccessToken(user: User): Promise<string> {
    if (!user.id) {
      throw new Error("User ID is required to generate access token");
    }

    // const roles = user.roles || [];

    const payload = {
      userId: user.id,
      email: user.email,
      role_id: user.role_id,
    };
    const secret = config.JWT_SECRET;
    const options: SignOptions = { expiresIn: config.JWT_EXPIRE };

    const access_token = jwt.sign(payload, secret, options);
    return access_token;
  }

  async logoutUser(
    userId: string,
    refreshToken: string,
  ): Promise<MessageResponse> {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify the JWT signature and extract sessionId from payload
    let payload: { userId?: string; sessionId?: string };
    try {
      payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as {
        userId?: string;
        sessionId?: string;
      };
    } catch (error) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    const sessionId = payload.sessionId;
    if (!sessionId) {
      throw new UnauthorizedError("Session ID missing from token");
    }

    // Fetch the session from the database and compare the hashed refresh token
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new UnauthorizedError("Session not found");
    }

    const tokenMatches = await bcrypt.compare(
      refreshToken,
      session.refresh_token,
    );
    if (!tokenMatches) throw new UnauthorizedError("Invalid refresh token");

    await sessionRepository.deleteSession(session.id!);
    return { message: "Logged out successfully" };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<RefreshTokenResponse> {
    if (!refreshToken) {
      throw new BadRequestError("Refresh token is required");
    }

    // Verify the JWT signature and extract sessionId from payload
    let payload: { userId?: string; sessionId?: string };
    try {
      payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as {
        userId?: string;
        sessionId?: string;
      };
    } catch (error) {
      if (
        error instanceof jwt.TokenExpiredError ||
        (error instanceof Error && error.name === "TokenExpiredError")
      ) {
        throw new UnauthorizedError("Refresh token has expired");
      }
      throw new UnauthorizedError("Invalid refresh token");
    }

    const userId = payload.userId;
    const sessionId = payload.sessionId;
    if (!userId || !sessionId) {
      throw new UnauthorizedError(
        "Refresh token payload missing userId or sessionId",
      );
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Fetch the session from the database and compare the hashed refresh token
    const session = await sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new UnauthorizedError("Session not found");
    }

    const tokenMatches = await bcrypt.compare(
      refreshToken,
      session.refresh_token,
    );
    if (!tokenMatches) throw new UnauthorizedError("Invalid refresh token");

    // Create new session and delete old
    const newSessionId = uuidv4();
    const newRefreshToken = await this.generateRefreshToken(user, newSessionId);
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 12);
    await sessionRepository.createSession({
      user_id: user.id!,
      refresh_token: hashedNewRefreshToken,
      id: newSessionId,
    });
    await sessionRepository.deleteSession(session.id!);

    const access_token = await this.generateAccessToken(user);
    const refresh_token = newRefreshToken;

    const session_id = newSessionId;
    return { access_token, refresh_token, session_id };
  }

  // Generate a refresh token for a user session
  private async generateRefreshToken(
    user: User,
    sessionId: string,
  ): Promise<string> {
    const payload = { userId: user.id, sessionId };
    const secret = config.JWT_REFRESH_SECRET;

    return jwt.sign(payload, secret, { expiresIn: "7d" });
  }
}
