import { afterAll, beforeAll, beforeEach } from 'vitest';
import sqlite3, { Database } from 'sqlite3';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create in-memory database for testing
export let testDb: Database;

// Type definitions based on your interfaces
export interface Post {
  id: string;
  title: string;
  body: string;
  created_at: string;
  user: string;
  email: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
}

export interface Addresses {
  id: string;
  user_id: string;
  street: string;
  state: string;
  city: string;
  zipcode: string;
}

// Test data interfaces
export interface TestUserData {
  name?: string;
  username?: string;
  email?: string;
  phone?: string | null;
}

export interface TestUser extends Required<TestUserData> {
  id: string;
}

export interface TestPostData {
  user_id?: string;
  title?: string;
  body?: string;
}

export interface TestPost extends Required<TestPostData> {
  id: string;
}

export interface TestAddressData {
  user_id?: string;
  street?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}

export interface TestAddress extends Required<TestAddressData> {
  id: string;
}

beforeAll(async (): Promise<void> => {
  testDb = new sqlite3.Database(':memory:');

  // Initialize test database schema
  await new Promise<void>((resolve, reject) => {
    testDb.serialize(() => {
      // Users table
      testDb.run(`CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err: Error | null) => {
        if (err) reject(err);
      });

      // Addresses table
      testDb.run(`CREATE TABLE addresses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        street TEXT NOT NULL,
        state TEXT NOT NULL,
        city TEXT NOT NULL,
        zipcode TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`, (err: Error | null) => {
        if (err) reject(err);
      });

      // Posts table
      testDb.run(`CREATE TABLE posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`, (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
});

afterAll(async (): Promise<void> => {
  if (testDb) {
    await new Promise<void>((resolve) => {
      testDb.close(() => resolve());
    });
  }
});

beforeEach(async (): Promise<void> => {
  // Clean up data before each test
  await new Promise<void>((resolve, reject) => {
    testDb.serialize(() => {
      testDb.run('DELETE FROM posts', (err: Error | null) => {
        if (err) reject(err);
      });
      testDb.run('DELETE FROM addresses', (err: Error | null) => {
        if (err) reject(err);
      });
      testDb.run('DELETE FROM users', (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
});

// Helper function to create test user
export const createTestUser = async (userData: TestUserData = {}): Promise<TestUser> => {
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const defaultUser: Required<TestUserData> = {
    name: 'Test User',
    username: `testuser_${Date.now()}`,
    email: `test@example.com`,
    phone: '1234567890',
    ...userData
  };

  return new Promise<TestUser>((resolve, reject) => {
    const { name, username, email, phone } = defaultUser;
    testDb.run(
      'INSERT INTO users (id, name, username, email, phone) VALUES (?, ?, ?, ?, ?)',
      [id, name, username, email, phone],
      function(this: sqlite3.RunResult, err: Error | null) {
        if (err) reject(err);
        else resolve({
          id,
          ...defaultUser
        });
      }
    );
  });
};

// Helper function to create test post
export const createTestPost = async (postData: TestPostData = {}): Promise<TestPost> => {
  const id = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const defaultPost: Required<TestPostData> = {
    user_id: "1",
    title: 'Test Post',
    body: 'This is a test post body',
    ...postData
  };

  return new Promise<TestPost>((resolve, reject) => {
    const { user_id, title, body } = defaultPost;
    testDb.run(
      'INSERT INTO posts (id, user_id, title, body, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, user_id, title, body, new Date().toISOString()],
      function(this: sqlite3.RunResult, err: Error | null) {
        if (err) reject(err);
        else resolve({
          id,
          ...defaultPost
        });
      }
    );
  });
};

// Helper function to create test address
export const createTestAddress = async (addressData: TestAddressData = {}): Promise<TestAddress> => {
  const id = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const defaultAddress: Required<TestAddressData> = {
    user_id: "1",
    street: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    zipcode: '12345',
    ...addressData
  };

  return new Promise<TestAddress>((resolve, reject) => {
    const { user_id, street, city, state, zipcode } = defaultAddress;
    testDb.run(
      'INSERT INTO addresses (id, user_id, street, city, state, zipcode) VALUES (?, ?, ?, ?, ?, ?)',
      [id, user_id, street, city, state, zipcode],
      function(this: sqlite3.RunResult, err: Error | null) {
        if (err) reject(err);
        else resolve({
          id,
          ...defaultAddress
        });
      }
    );
  });
};

// Helper function to get a user by ID
export const getTestUser = async (id: string): Promise<User | null> => {
  return new Promise<User | null>((resolve, reject) => {
    testDb.get(
      'SELECT * FROM users WHERE id = ?',
      [id],
      (err: Error | null, row: any) => {
        if (err) reject(err);
        else resolve(row || null);
      }
    );
  });
};

// Helper function to get a post by ID with user info
export const getTestPost = async (id: string): Promise<Post | null> => {
  return new Promise<Post | null>((resolve, reject) => {
    testDb.get(
      `SELECT
        p.id,
        p.title,
        p.body,
        p.created_at,
        u.name as user,
        u.email
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`,
      [id],
      (err: Error | null, row: any) => {
        if (err) reject(err);
        else resolve(row || null);
      }
    );
  });
};

// Helper function to get an address by ID
export const getTestAddress = async (id: string): Promise<Addresses | null> => {
  return new Promise<Addresses | null>((resolve, reject) => {
    testDb.get(
      'SELECT * FROM addresses WHERE id = ?',
      [id],
      (err: Error | null, row: any) => {
        if (err) reject(err);
        else resolve(row || null);
      }
    );
  });
};

// Helper function to count records in a table
export const countRecords = async (tableName: string): Promise<number> => {
  return new Promise<number>((resolve, reject) => {
    testDb.get(
      `SELECT COUNT(*) as count FROM ${tableName}`,
      (err: Error | null, row: any) => {
        if (err) reject(err);
        else resolve(row.count);
      }
    );
  });
};

// Helper function to create a user with posts
export const createUserWithPosts = async (
  userData: TestUserData = {},
  postCount: number = 2
): Promise<{ user: TestUser; posts: TestPost[] }> => {
  const user = await createTestUser(userData);
  const posts: TestPost[] = [];

  for (let i = 0; i < postCount; i++) {
    const post = await createTestPost({
      user_id: user.id,
      title: `Test Post ${i + 1}`,
      body: `Test post body ${i + 1}`
    });
    posts.push(post);
  }

  return { user, posts };
};

// Helper function to create a user with address
export const createUserWithAddress = async (
  userData: TestUserData = {},
  addressData: TestAddressData = {}
): Promise<{ user: TestUser; address: TestAddress }> => {
  const user = await createTestUser(userData);
  const address = await createTestAddress({
    user_id: user.id,
    ...addressData
  });

  return { user, address };
};

// Helper to execute raw SQL for complex test scenarios
export const executeQuery = async (query: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    testDb.all(query, params, (err: Error | null, rows: any[]) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Helper to execute single row query
export const executeQuerySingle = async (query: string, params: any[] = []): Promise<any | null> => {
  return new Promise((resolve, reject) => {
    testDb.get(query, params, (err: Error | null, row: any) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
};
