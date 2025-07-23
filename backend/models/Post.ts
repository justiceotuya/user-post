import { PaginationResult, paginateQuery } from '../utils/pagination.js';

import { Database } from 'sqlite3';

export interface PostData {
  user_id: number;
  title: string;
  body: string;
}

export interface Post {
  id: string;
  title: string;
  body: string;
  created_at: string;
  user: string;
  email: string;
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

interface PostRow {
  id: number;
  user_id: number;
  title: string;
  body: string;
  created_at: string;
  name: string;
  email: string;
}

export class PostModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Get all posts with user data and pagination
  async getAll(page: number = 1, limit: number = 10): Promise<PaginationResult<Post>> {
    const countQuery = 'SELECT COUNT(*) as total FROM posts';
    const dataQuery = `
      SELECT
        p.id,
        p.title,
        p.body,
        p.created_at,
        u.name,
        u.email
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.id
      LIMIT ? OFFSET ?
    `;

    // Data transformer to format posts with user data
    const postTransformer = (row: PostRow): Post => ({
      id: row.id.toString(),
      title: row.title,
      body: row.body,
      created_at: row.created_at || new Date().toISOString(),
      user: row.name || 'Unknown User',
      email: row.email || 'unknown@example.com'
    });

    return await paginateQuery<Post>(this.db, countQuery, dataQuery, [], [], page, limit, postTransformer);
  }

  // Get posts by user ID with user data and pagination
  async getByUserId(userId: number, page: number = 1, limit: number = 10): Promise<PaginationResult<Post>> {
    const countQuery = 'SELECT COUNT(*) as total FROM posts WHERE user_id = ?';
    const dataQuery = `
      SELECT
        p.id,
        p.title,
        p.body,
        p.created_at,
        u.name,
        u.email
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.id
      LIMIT ? OFFSET ?
    `;

    // Data transformer to format posts with user data
    const postTransformer = (row: PostRow): Post => ({
      id: row.id.toString(),
      title: row.title,
      body: row.body,
      created_at: row.created_at || new Date().toISOString(),
      user: row.name || 'Unknown User',
      email: row.email || 'unknown@example.com'
    });

    return await paginateQuery<Post>(this.db, countQuery, dataQuery, [userId], [userId], page, limit, postTransformer);
  }

  // Get post by ID with user data
  async getById(id: number): Promise<Post | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT
          p.id,
          p.title,
          p.body,
          p.created_at,
          u.name,
          u.email
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `;

      this.db.get(query, [id], (err: Error | null, row: PostRow) => {
        if (err) return reject(err);
        if (!row) return resolve(null);

        const post: Post = {
          id: row.id.toString(),
          title: row.title,
          body: row.body,
          created_at: row.created_at || new Date().toISOString(),
          user: row.name || 'Unknown User',
          email: row.email || 'unknown@example.com'
        };

        resolve(post);
      });
    });
  }

  // Create a new post
  async create(postData: PostData): Promise<CreatePostResult> {
    return new Promise((resolve, reject) => {
      const { user_id, title, body } = postData;
      const query = 'INSERT INTO posts (user_id, title, body, created_at) VALUES (?, ?, ?, ?)';
      const created_at = new Date().toISOString();

      this.db.run(query, [user_id, title, body, created_at], function(err: Error | null) {
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
