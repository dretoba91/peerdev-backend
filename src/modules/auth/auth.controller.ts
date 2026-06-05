import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import type { User } from "../user/user.types";
import { logger } from "../../shared/utils/loggers";
import {
  sendAuthResponse,
  sendRefreshTokenResponse,
} from "../../shared/utils/sendClientResponse";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: User = req.body;
      const registeredUser = await this.authService.registerUser(userData);
      res.status(201).json(registeredUser);
    } catch (error) {
      next(error);
    }
  }

  // verify OTP
  async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id, code } = req.body;
      const ip_address = req.ip as string;
      const device_id = req.headers["x-device-id"] as string | undefined;
      if (!user_id || !code) {
        res.status(400).json({ error: "user_id and code are required" });
        return;
      }

      const result = await this.authService.verifyOTP(
        user_id,
        code,
        device_id,
        ip_address,
      );
      sendAuthResponse(req, res, result);
    } catch (error) {
      next(error);
    }
  }

  async resendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      const result = await this.authService.resendOtp(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ip_address = req.ip as string;
      const device_id = req.headers["x-device-id"] as string | undefined;

      if (!email || !password) {
        res.status(400).json({ error: "email and password are required" });
        return;
      }

      const loggedInUser = await this.authService.loginUser(
        email,
        password,
        device_id,
        ip_address,
      );
      sendAuthResponse(req, res, loggedInUser);
    } catch (error) {
      logger.error("Login user error:", error);
      next(error);
    }
  }

  async logoutUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id, refresh_token } = req.body;
      if (!user_id) {
        res.status(400).json({ error: "user_id is required" });
        return;
      }

      if (!refresh_token) {
        res.status(400).json({ error: "refresh_token is required" });
        return;
      }

      const result = await this.authService.logoutUser(user_id, refresh_token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token) {
        res.status(400).json({ error: "refresh_token is required" });
        return;
      }

      const result = await this.authService.refreshAccessToken(refresh_token);

      sendRefreshTokenResponse(req, res, result);
    } catch (error) {
      next(error);
    }
  }
}
