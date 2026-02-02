import express from 'express';
import {
  createCategoryController,
  getCategoryTreeController,
  updateCategoryController,
  deleteCategoryController,
  getPublicCategoriesController,
} from '../controllers/category.controller.js';
import  authMiddleware  from '../middleware/check-auth.middleware.js';

const router = express.Router();

// simple admin guard; adjust role name if needed
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// Public / creator-accessible: admin-created categories for upload UI
router.get('/categories', authMiddleware, getPublicCategoriesController);

// Admin: Create, read, update, delete
router.get('/',  requireAdmin, getCategoryTreeController);
router.post('/',  requireAdmin, createCategoryController);
router.patch('/:id',  requireAdmin, updateCategoryController);
router.delete('/:id',  requireAdmin, deleteCategoryController);

export default router;
