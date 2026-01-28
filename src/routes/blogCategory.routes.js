import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import * as blogCategoryController from '../controllers/blogCategory.controller.js';

const router = express.Router();

// Blog Category CRUD (admin only)
router.post('/', adminAuth, blogCategoryController.createBlogCategory);
router.get('/', blogCategoryController.getBlogCategories);
router.patch('/:id', adminAuth, blogCategoryController.updateBlogCategory);
router.delete('/:id', adminAuth, blogCategoryController.deleteBlogCategory);

export default router;
