import { Database } from 'sqlite3';
import { paginateQuery, PaginationResult } from '../utils/pagination.js';

export interface PostData {
  user_id: number;
  title: string;
  body: string;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  body: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePostResult {
  id: number;
  user_id: number;
  title: string;
  body: string;
}

export interface UpdateResult {
  changes: number;
}

export interface DeleteResult {
  deleted: number;
}

export class PostModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Get all posts with pagination
  async getAll(page: number = 1, limit: number = 10): Promise<PaginationResult<Post>> {
    const countQuery = 'SELECT COUNT(*) as total FROM posts';
    const dataQuery = 'SELECT * FROM posts ORDER BY id LIMIT ? OFFSET ?';
    
    return await paginateQuery<Post>(this.db, countQuery, dataQuery, [], [], page, limit);
  }

  // Get posts by user ID with pagination
  async getByUserId(userId: number, page: number = 1, limit: number = 10): Promise<PaginationResult<Post>> {
    const countQuery = 'SELECT COUNT(*) as total FROM posts WHERE user_id = ?';
    const dataQuery = 'SELECT * FROM posts WHERE user_id = ? ORDER BY id LIMIT ? OFFSET ?';
    
    return await paginateQuery<Post>(this.db, countQuery, dataQuery, [userId], [userId], page, limit);
  }

  // Get post by ID
  async getById(id: number): Promise<Post | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM posts WHERE id = ?', [id], (err: Error | null, row: Post) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  }

  // Create a new post
  async create(postData: PostData): Promise<CreatePostResult> {
    return new Promise((resolve, reject) => {
      const { user_id, title, body } = postData;
      const query = 'INSERT INTO posts (user_id, title, body) VALUES (?, ?, ?)';
      
      this.db.run(query, [user_id, title, body], function(err: Error | null) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...postData });
      });
    });
  }

  // Update a post
  async update(id: number, postData: Partial<Pick<PostData, 'title' | 'body'>>): Promise<UpdateResult> {
    return new Promise((resolve, reject) => {
      const { title, body } = postData;
      const query = 'UPDATE posts SET title = ?, body = ? WHERE id = ?';
      
      this.db.run(query, [title, body, id], function(err: Error | null) {
        if (err) return reject(err);
        resolve({ changes: this.changes });
      });
    });
  }

  // Delete a post
  async delete(id: number): Promise<DeleteResult> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM posts WHERE id = ?', [id], function(err: Error | null) {
        if (err) return reject(err);
        resolve({ deleted: this.changes });
      });
    });
  }
}

export default PostModel;