
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Implement user controller methods here
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { full_name, email, password, role_id, experience_level } = req.body;
      const user = await this.userService.createUser({ full_name, email, password, role_id, experience_level });
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {      
    try {
      const users = await this.userService.findAllUsers();
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
        res.status(404).json({ error: 'User not found' });
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
        res.status(404).json({ error: 'User not found' });
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
      const { id, roleType } = req.body; // id is now UUID string
      const updatedUser = await this.userService.updateUserRole(id, roleType);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
}