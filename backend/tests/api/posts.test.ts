import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestPost, createTestUser, testDb } from '../setup';

import cors from 'cors';
import createRoutes from '../../routes';
import express from 'express';
import request from 'supertest';

describe('Posts API', () => {
  let app: express.Application;
  let testUserId: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(cors());
    app.use('/api', createRoutes(testDb));
  });

  beforeEach(async () => {
    testUserId = (await createTestUser()).id;
  });

  describe('GET /api/posts', () => {
    beforeEach(async () => {
      await createTestPost({ user_id: testUserId, title: 'Post 1' });
      await createTestPost({ user_id: testUserId, title: 'Post 2' });
    });

    it('should return paginated posts', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toHaveProperty('currentPage');
      expect(response.body.pagination).toHaveProperty('totalCount');
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/posts?page=1&limit=1')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return single post when found', async () => {
      const postId = (await createTestPost({ user_id: testUserId, title: 'Test Post' })).id;

      const response = await request(app)
        .get(`/api/posts/${postId}`)
        .expect(200);

      expect(response.body.id).toBe(postId.toString());
      expect(response.body.title).toBe('Test Post');
      expect(response.body.user).toBe('Test User');
    });

    it('should return 404 when post not found', async () => {
      await request(app)
        .get('/api/posts/999999')
        .expect(404);
    });
  });

  describe('POST /api/posts', () => {
    it('should create new post successfully', async () => {
      const postData = {
        user_id: testUserId,
        title: 'New Post',
        body: 'New post body'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(postData.title);
      expect(response.body.body).toBe(postData.body);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        user_id: testUserId,
        // Missing required title
        body: 'Body without title'
      };

      await request(app)
        .post('/api/posts')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update post successfully', async () => {
      const postId = (await createTestPost({ user_id: testUserId, title: 'Original' })).id;

      const updateData = {
        title: 'Updated Title',
        body: 'Updated Body'
      };

      const response = await request(app)
        .put(`/api/posts/${postId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toContain('updated');
    });

    it('should return 404 when updating non-existent post', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      await request(app)
        .put('/api/posts/999999')
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete post successfully', async () => {
      const postId = (await createTestPost({ user_id: testUserId })).id;

      const response = await request(app)
        .delete(`/api/posts/${postId}`)
        .expect(200);

      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 when deleting non-existent post', async () => {
      await request(app)
        .delete('/api/posts/999999')
        .expect(404);
    });
  });

  describe('GET /api/users/:userId/posts', () => {
    beforeEach(async () => {
      await createTestPost({ user_id: testUserId, title: 'User Post 1' });
      await createTestPost({ user_id: testUserId, title: 'User Post 2' });
    });

    it('should return user posts with custom format', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}/posts`)
        .expect(200);

      expect(response.body.data.user).toBe('Test User');
      expect(response.body.data.posts).toHaveLength(2);
      expect(response.body.pagination).toHaveProperty('totalCount');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/users/999999/posts')
        .expect(404);
    });
  });
});
