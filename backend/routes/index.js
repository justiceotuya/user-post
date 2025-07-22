const express = require('express');
const UserController = require('../controllers/userController');
const PostController = require('../controllers/postController');

function createRoutes(db) {
  const router = express.Router();
  const userController = new UserController(db);
  const postController = new PostController(db);

  // User routes
  router.get('/', userController.getAllUsers.bind(userController));
  router.get('/users', userController.getUsersWithAddresses.bind(userController));
  router.get('/users/:userId', userController.getUserById.bind(userController));
  router.post('/users', userController.createUser.bind(userController));
  router.put('/users/:userId', userController.updateUser.bind(userController));
  router.delete('/users/:userId', userController.deleteUser.bind(userController));

  // Post routes
  router.get('/posts', postController.getAllPosts.bind(postController));
  router.get('/posts/:postId', postController.getPostById.bind(postController));
  router.post('/posts', postController.createPost.bind(postController));
  router.put('/posts/:postId', postController.updatePost.bind(postController));
  router.delete('/posts/:postId', postController.deletePost.bind(postController));
  router.get('/users/:userId/posts', postController.getPostsByUserId.bind(postController));

  return router;
}

module.exports = createRoutes;
