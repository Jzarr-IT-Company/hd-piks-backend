import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';

import * as blogController from '../controllers/blog.controller.js';

const router = express.Router();

// Blog CRUD routes (admin only)

// Blog CRUD routes (admin only)


// Public routes (must be before :id route)
router.get('/public', blogController.getPublicBlogs); // GET /blogs/public
router.get('/slug/:slug', blogController.getPublicBlogBySlug); // GET /blogs/slug/:slug

// Admin-only routes
router.post('/', adminAuth, blogController.createBlog);
router.get('/', adminAuth, blogController.getBlogs);
router.get('/:id', adminAuth, blogController.getBlogById);
router.patch('/:id', adminAuth, blogController.updateBlog);
router.delete('/:id', adminAuth, blogController.deleteBlog);

export default router;
