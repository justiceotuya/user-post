import { PostData, PostModel } from '../models/Post.js';
import { Request, Response } from 'express';

import { Database } from 'sqlite3';

export class PostController {
  private postModel: PostModel;

  constructor(db: Database) {
    this.postModel = new PostModel(db);
  }

  // Get all posts
  async getAllPosts(req: Request, res: Response): Promise<void> {
    try {
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = parseInt(req.query.limit as string) || 10;

      const result = await this.postModel.getAll(page, limit);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  // Get posts by user ID
  async getPostsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const userIdNumber: number = parseInt(userId);
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = parseInt(req.query.limit as string) || 10;

      if (isNaN(userIdNumber)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const result = await this.postModel.getByUserId(userIdNumber, page, limit);
      res.json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  // Get post by ID
  async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const postIdNumber: number = parseInt(postId);

      if (isNaN(postIdNumber)) {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
      }

      const post = await this.postModel.getById(postIdNumber);

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.json(post);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  // Create a new post
  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const postData: PostData = req.body;

      // Validate required fields
      if (!postData.user_id || !postData.title || !postData.body) {
        res.status(400).json({
          error: 'Missing required fields: user_id, title, and body are required'
        });
        return;
      }

      const result = await this.postModel.create(postData);
      res.status(201).json(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  // Update a post
  async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const postIdNumber: number = parseInt(postId);
      const postData: Partial<Pick<PostData, 'title' | 'body'>> = req.body;

      if (isNaN(postIdNumber)) {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
      }

      // Validate that at least one field is provided for update
      if (!postData.title && !postData.body) {
        res.status(400).json({
          error: 'At least one field (title or body) must be provided for update'
        });
        return;
      }

      const result = await this.postModel.update(postIdNumber, postData);

      if (result.changes === 0) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.json({ message: 'Post updated successfully', ...result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  // Delete a post
  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const postIdNumber: number = parseInt(postId);

      if (isNaN(postIdNumber)) {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
      }

      const result = await this.postModel.delete(postIdNumber);

      if (result.deleted === 0) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.json({ message: 'Post deleted successfully', ...result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }
}

export default PostController;
