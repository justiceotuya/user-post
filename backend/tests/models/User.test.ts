import { beforeEach, describe, expect, it } from 'vitest';
import { createTestUser, testDb } from '../setup';

import { UserModel } from '../../models/User';

describe('UserModel', () => {
  let userModel: UserModel;

  beforeEach(() => {
    userModel = new UserModel(testDb);
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        phone: '1234567890'
      };

      const result = await userModel.create(userData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(userData.name);
      expect(result.username).toBe(userData.username);
      expect(result.email).toBe(userData.email);
      expect(result.phone).toBe(userData.phone);
    });

    it('should reject duplicate username', async () => {
      const userData = {
        name: 'User 1',
        username: 'duplicate',
        email: 'user1@example.com',
        phone: '1111111111'
      };

      await userModel.create(userData);

      const duplicateUser = {
        name: 'User 2',
        username: 'duplicate', // Same username
        email: 'user2@example.com',
        phone: '2222222222'
      };

      await expect(userModel.create(duplicateUser)).rejects.toThrow();
    });

    it('should reject duplicate email', async () => {
      const userData = {
        name: 'User 1',
        username: 'user1',
        email: 'duplicate@example.com',
        phone: '1111111111'
      };

      await userModel.create(userData);

      const duplicateUser = {
        name: 'User 2',
        username: 'user2',
        email: 'duplicate@example.com', // Same email
        phone: '2222222222'
      };

      await expect(userModel.create(duplicateUser)).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    beforeEach(async () => {
      await createTestUser({ name: 'Charlie', username: 'charlie', email: 'charlie@example.com' });
      await createTestUser({ name: 'Bob', username: 'bob', email: 'bob@example.com' });
      await createTestUser({ name: 'Alice', username: 'alice', email: 'alice@example.com' });
    });

    it('should return paginated users sorted by name', async () => {
      const result = await userModel.getAll(1, 2);

      expect(result.data).toHaveLength(2);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalCount).toBe(3);
      expect(result.pagination.totalPages).toBe(2);

      // Check if sorted by name (Alice should come first)
      expect(result.data[0].name).toBe('Alice');
      expect(result.data[1].name).toBe('Bob');
    });

    it('should support ascending sort order', async () => {
      const result = await userModel.getAll(1, 10);
      expect(result.data[0].name).toBe('Alice'); // Last alphabetically
    });
  });

  describe('getById', () => {
    it('should return user when found', async () => {
      const userId = (await createTestUser({ name: 'Test User', email: 'test@example.com'})).id;

      const user = await userModel.getById(userId);

      expect(user).not.toBeNull();
      expect(user!.id).toBe(userId);
      expect(user!.name).toBe('Test User');
      expect(user!.email).toBe('test@example.com');
    });

    it('should return null when user not found', async () => {
      const user = await userModel.getById('999999');
      expect(user).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userId = (await createTestUser()).id;

      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        username: 'updated@example.com'
      };

      const result = await userModel.update(userId, updateData);

      expect(result.changes).toBe(1);

      // Verify update
      const updatedUser = await userModel.getById(userId);
      expect(updatedUser!.name).toBe('Updated Name');
      expect(updatedUser!.email).toBe('updated@example.com');
    });

    it('should return 0 changes when user not found', async () => {
      const result = await userModel.update('999999', { name: 'New Name' });
      expect(result.changes).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
        const userId = (await createTestUser({
          name:"otuya", username:"inhale"
      })).id
        const user = await userModel.getById(userId);
      const result = await userModel.delete(userId);


      expect(result.deleted).toBe(1);

      // Verify deletion
      const deletedUser = await userModel.getById(userId);
      expect(deletedUser).toBeNull();
    });

    it('should return 0 deleted when user not found', async () => {
      const result = await userModel.delete('999999');
      expect(result.deleted).toBe(0);
    });
  });
});
