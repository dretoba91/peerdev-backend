
import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  // Implement user controller methods here
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { first_name, last_name, email, password, experience_level } =
        req.body;
      const user = await this.userService.createUser({
        first_name,
        last_name,
        email,
        password,
        experience_level,
        role_id: "",
      });
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Extract query params from the incoming HTTP request URL
      const { page, limit } = req.query;
      const users = await this.userService.findAllUsers(page, limit);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id; // UUID string
      const user = await this.userService.findUserById(id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.body;
      const updatedUser = await this.userService.updateUser(user);
      if (!updatedUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id; // UUID string
      await this.userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // update user role
  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { user_id, role_id } = req.body;
      const updatedUser = await this.userService.updateUserRole(
        user_id,
        role_id,
      );
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
}