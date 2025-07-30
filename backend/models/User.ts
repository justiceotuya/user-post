import { PaginationResult, paginateQuery } from '../utils/pagination.js';

import { Database } from 'sqlite3';

export interface Address {
  street: string;
  state: string;
  city: string;
  zipcode: string;
}

export interface UserData {
  name: string;
  username: string;
  email: string;
  phone?: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  addresses?: Address | null;
}

export interface CreateUserResult {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
}

export interface UpdateResult {
  changes: number;
}

export interface DeleteResult {
  deleted: number;
}

interface UserRow {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  street: string;
  state: string;
  city: string;
  zipcode: string;
}

export class UserModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // Get all users with pagination
  async getAll(page: number = 1, limit: number = 10): Promise<PaginationResult<User>> {
    const countQuery = 'SELECT COUNT(*) as total FROM users';
    const dataQuery = 'SELECT * FROM users ORDER BY name LIMIT ? OFFSET ?';

    return await paginateQuery<User>(this.db, countQuery, dataQuery, [], [], page, limit);
  }

  // Get users with addresses and pagination
  async getAllWithAddresses(page: number = 1, limit: number = 10): Promise<PaginationResult<User>> {
    const countQuery = 'SELECT COUNT(*) as total FROM users';
    const dataQuery = `
      SELECT
        u.id,
        u.name,
        u.username,
        u.email,
        u.phone,
        a.street,
        a.state,
        a.city,
        a.zipcode
      FROM users u
      LEFT JOIN addresses a ON u.id = a.user_id
      ORDER BY u.name
      LIMIT ? OFFSET ?
    `;

    // Data transformer function to format user data with nested address
    const userTransformer = (row: UserRow): User => ({
      id: row.id,
      name: row.name,
      username: row.username,
      email: row.email,
      phone: row.phone,
      addresses:  {
        street: row.street,
        state: row.state,
        city: row.city,
        zipcode: row.zipcode
      }
    });

    return await paginateQuery<User>(this.db, countQuery, dataQuery, [], [], page, limit, userTransformer, 'users');
  }

  // Get user by ID
  async getById(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT
          u.id,
          u.name,
          u.username,
          u.email,
          u.phone,
          a.street,
          a.state,
          a.city,
          a.zipcode
        FROM users u
        LEFT JOIN addresses a ON u.id = a.user_id
        WHERE u.id = ?
      `;

      this.db.get(query, [id], (err: Error | null, row: UserRow) => {
        if (err) return reject(err);
        if (!row) return resolve(null);

        const user: User = {
          id: row.id,
          name: row.name,
          username: row.username,
          email: row.email,
          phone: row.phone,
          addresses:{
            street: row.street,
            state: row.state,
            city: row.city,
            zipcode: row.zipcode
          }
        };

        resolve(user);
      });
    });
  }

  // Create a new user
  async create(userData: UserData): Promise<CreateUserResult> {
    return new Promise((resolve, reject) => {
      const { name, username, email, phone } = userData;
      const query = 'INSERT INTO users (name, username, email, phone) VALUES (?, ?, ?, ?)';

      this.db.run(query, [name, username, email, phone], function(err: Error | null) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...userData });
      });
    });
  }

  // Update a user
  async update(id: number, userData: Partial<UserData>): Promise<UpdateResult> {
    return new Promise((resolve, reject) => {
      const { name, username, email, phone } = userData;
      const query = 'UPDATE users SET name = ?, username = ?, email = ?, phone = ? WHERE id = ?';

      this.db.run(query, [name, username, email, phone, id], function(err: Error | null) {
        if (err) return reject(err);
        resolve({ changes: this.changes });
      });
    });
  }

  // Delete a user
  async delete(id?: string): Promise<DeleteResult> {
    if (id && id?.length > 0) {
      return new Promise((resolve, reject) => {
        this.db.run('DELETE FROM users WHERE id = ?', [id], function(err: Error | null) {
          if (err) return reject(err);
          resolve({ deleted: this.changes });
        });
      });
    } else {
      // No id provided: delete the first user without an id (id IS NULL)
      return new Promise((resolve, reject) => {
        // Find the first user where id IS NULL
        this.db.get('SELECT rowid FROM users WHERE id IS NULL LIMIT 1', [], (err: Error | null, row: { rowid: number } | undefined) => {
          if (err) return reject(err);
          if (!row) return resolve({ deleted: 0 });
          this.db.run('DELETE FROM users WHERE rowid = ?', [row.rowid], function(err2: Error | null) {
            if (err2) return reject(err2);
            resolve({ deleted: this.changes });
          });
        });
      });
    }
  }
}

export default UserModel;
