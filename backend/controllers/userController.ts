import { Request, Response } from 'express';
import { UserData, UserModel } from '../models/User.js';

import { Database } from 'sqlite3';

export class UserController {
  private userModel: UserModel;

  constructor(db: Database) {
    this.userModel = new UserModel(db);
  }

  // Get all users (root endpoint)
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = parseInt(req.query.limit as string) || 10;

      const result = await this.userModel.getAll(page, limit);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  // Get users with addresses
  async getUsersWithAddresses(req: Request, res: Response): Promise<void> {
    try {
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = parseInt(req.query.limit as string) || 10;

      const result = await this.userModel.getAllWithAddresses(page, limit);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

        const user = await this.userModel.getById(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  // Create a new user
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: UserData = req.body;

      // Validate required fields
      if (!userData.name || !userData.username || !userData.email) {
        res.status(400).json({
          error: 'Missing required fields: name, username, and email are required'
        });
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
      }

      const result = await this.userModel.create(userData);
      res.status(201).json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  // Update a user
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const userData: Partial<UserData> = req.body;


      // Validate email format if provided
      if (userData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
          res.status(400).json({ error: 'Invalid email format' });
          return;
        }
      }

      const result = await this.userModel.update(userId, userData);

      if (result.changes === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ message: 'User updated successfully', ...result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  // Delete a user
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;


      const result = await this.userModel.delete(userId);

      if (result.deleted === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ message: 'User deleted successfully', ...result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }
}

export default UserController;
