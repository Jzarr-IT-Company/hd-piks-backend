import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import { adminOrCreatorAuth } from '../middleware/adminOrCreatorAuth.js';
import blogRoutes from './blog.routes.js';
import blogCategoryRoutes from './blogCategory.routes.js';
import {
  listAllUsers,
  listAllCreators,
  listAllImages,
  updateImageStatus,
  deleteImage,
  deleteUser,
  deleteCreator,
  updateCreatorStatus,
  getAdminAnalytics,
  listCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  listFlaggedContent
} from '../controllers/admin.controller.js';

const router = express.Router();


// Allow both admin and creator to fetch categories
router.get('/categories', adminOrCreatorAuth, listCategories);

// All other admin routes remain admin-only
router.use(adminAuth);

router.get('/users', listAllUsers);
router.get('/creators', listAllCreators);
router.get('/images', listAllImages);
router.patch('/images/:id/status', updateImageStatus);
router.delete('/images/:id', deleteImage);
router.delete('/users/:id', deleteUser);
router.delete('/creators/:id', deleteCreator);
router.patch('/creators/:id/status', updateCreatorStatus);
router.get('/analytics', getAdminAnalytics);
// ...existing code...
router.post('/categories', addCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Blog category management routes (admin only)
router.use('/blog-categories', blogCategoryRoutes);

export default router;
