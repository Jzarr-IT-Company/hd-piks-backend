import express from 'express';
import { createCategoryController, getCategoryTreeController, updateCategoryController, deleteCategoryController } from '../controllers/category.controller.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Public: Get category tree
router.get('/', getCategoryTreeController);

// Admin: Create, update, delete
router.post('/', adminAuth, createCategoryController);
router.get('/', adminAuth, getCategoryTreeController);
router.patch('/:id', adminAuth, updateCategoryController);
router.delete('/:id', adminAuth, deleteCategoryController);

export default router;
