import { PostData, PostModel } from '../../models/Post';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestPost, createTestUser, testDb } from '../setup';

describe('PostModel', () => {
  let postModel: PostModel;
  let testUserId: string;

  beforeEach(async () => {
    postModel = new PostModel(testDb);
    const testUser = await createTestUser();
    testUserId = testUser.id;
  });

  describe('create', () => {
    it('should create a new post successfully', async () => {
      const postData: PostData = {
        user_id: testUserId,
        title: 'Test Post Title',
        body: 'Test post body content'
      };

      const result = await postModel.create(postData);

      expect(result).toHaveProperty('id');
      expect(result.user_id).toBe(testUserId);
      expect(result.title).toBe(postData.title);
      expect(result.body).toBe(postData.body);
    });

    it('should reject when creating post with invalid user_id', async () => {
      const postData: PostData = {
        user_id: '999999', // Non-existent user
        title: 'Test Post',
        body: 'Test body'
      };

      await expect(postModel.create(postData)).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    beforeEach(async () => {
      // Create multiple test posts
      await createTestPost({ user_id: testUserId + 1, title: 'Post 1', body: 'Body 1' });
      await createTestPost({ user_id: testUserId + 2, title: 'Post 2', body: 'Body 2' });
      await createTestPost({ user_id: testUserId+ 3, title: 'Post 3', body: 'Body 3' });
    });

    it('should return paginated posts with user data', async () => {
      const result = await postModel.getAll(1, 2);

      expect(result.data).toHaveLength(2);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.limit).toBe(2);
      expect(result.pagination.totalCount).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(false);

      // Check post structure
      const post = result.data[0];
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('body');
      expect(post).toHaveProperty('created_at');
      expect(post).toHaveProperty('user');
      expect(post).toHaveProperty('email');
    });

    it('should return empty result when no posts exist', async () => {
      // Clear all posts
      await new Promise<void>((resolve) => {
        testDb.run('DELETE FROM posts', () => resolve());
      });

      const result = await postModel.getAll();

      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalCount).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe('getById', () => {
    it('should return post with user data when found', async () => {
      const postId = (await createTestPost({ user_id: testUserId, title: 'Test Post', body: 'Test Body' })).id;

      const post = await postModel.getById(postId);

      expect(post).not.toBeNull();
      expect(post!.id).toBe(postId.toString());
      expect(post!.title).toBe('Test Post');
      expect(post!.body).toBe('Test Body');
      expect(post!.user).toBe('Test User');
      expect(post!.email).toBe('test@example.com');
    });

    it('should return null when post not found', async () => {
      const post = await postModel.getById('999999');
      expect(post).toBeNull();
    });
  });

  describe('getByUserId', () => {
    beforeEach(async () => {
      await createTestPost({ user_id: testUserId, title: 'User Post 1', body: 'Body 1' });
      await createTestPost({ user_id: testUserId, title: 'User Post 2', body: 'Body 2' });
    });

    it('should return user posts with custom format', async () => {
      const result = await postModel.getByUserId(testUserId.toString(), 1, 10);

      expect(result.data.user).toBe('Test User');
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.posts).toHaveLength(2);
      expect(result.pagination.totalCount).toBe(2);

      const post = result.data.posts[0];
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('body');
    });

    it('should reject when user not found', async () => {
      await expect(postModel.getByUserId('999999')).rejects.toThrow('User not found');
    });

    it('should handle pagination correctly', async () => {
      const result = await postModel.getByUserId(testUserId.toString(), 1, 1);

      expect(result.data.posts).toHaveLength(1);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNextPage).toBe(true);
    });
  });

  describe('update', () => {
    it('should update post successfully', async () => {
      const postId = (await createTestPost({ user_id: testUserId, title: 'Original Title', body: 'Original Body' })).id;

      const updateData = {
        title: 'Updated Title',
        body: 'Updated Body'
      };

      const result = await postModel.update(postId, updateData);

      expect(result.changes).toBe(1);

      // Verify the update
      const updatedPost = await postModel.getById(postId);
      expect(updatedPost!.title).toBe('Updated Title');
      expect(updatedPost!.body).toBe('Updated Body');
    });

    it('should return 0 changes when post not found', async () => {
      const result = await postModel.update('999999', { title: 'New Title' });
      expect(result.changes).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete post successfully', async () => {
      const postId = (await createTestPost({ user_id: testUserId })).id;

      const result = await postModel.delete(postId.toString());

      expect(result.deleted).toBe(1);

      // Verify deletion
      const deletedPost = await postModel.getById(postId);
      expect(deletedPost).toBeNull();
    });

    it('should return 0 deleted when post not found', async () => {
      const result = await postModel.delete('999999');
      expect(result.deleted).toBe(0);
    });
  });
});
