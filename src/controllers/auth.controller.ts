import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { User } from "../models/user.model";
import { logger } from "../utils/loggers";

export class AuthContoller {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
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

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const loggedInUser = await this.authService.loginUser(email, password);
      res.status(200).json(loggedInUser);
    } catch (error) {
      logger.error("Login user error:", error);
      next(error);
    }
  }
}
