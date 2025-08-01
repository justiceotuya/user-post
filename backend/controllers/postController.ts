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
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = parseInt(req.query.limit as string) || 10;

      const result = await this.postModel.getByUserId(userId, page, limit);
      res.json(result);
    } catch (error) {
      let errorMessage = 'Unknown error occurred';
      let errorStatus = 500;
      if (error instanceof Error) {
       errorMessage =  error.message
      } else {
        errorMessage =  "Unknown error"
      }
      if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        // @ts-ignore
        errorStatus = parseInt( error.statusCode);
      } else {
        errorStatus = 500
      }


      res.status(errorStatus).json({ error: errorMessage });
    }
  }

  // Get post by ID
  async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const post = await this.postModel.getById(postId);

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
      const postData: Partial<Pick<PostData, 'title' | 'body'>> = req.body;
      // Validate that at least one field is provided for update
      if (!postData.title && !postData.body) {
        res.status(400).json({
          error: 'At least one field (title or body) must be provided for update'
        });
        return;
      }

      const result = await this.postModel.update(postId, postData);
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


      const result = await this.postModel.delete(postId);

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
