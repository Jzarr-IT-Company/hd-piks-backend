import express from "express";
import {
  createSubCategoryCollection,
  getSubCategoryCollections,
  getSubCategoryCollectionById,
  getSubCategoryCollectionBySlug,
  updateSubCategoryCollection,
  deleteSubCategoryCollection,
  addAssetsToCollection,
  removeAssetFromCollection,
  getTopCollectionsForParent,
} from "../controllers/subCategoryCollection.controller.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

/**
 * ADMIN ROUTES (protected with adminAuth)
 */

// Create collection
router.post("/admin/sub-category-collections", adminAuth, createSubCategoryCollection);

// List collections (with filters)
router.get("/admin/sub-category-collections", adminAuth, getSubCategoryCollections);

// Get collection by id
router.get("/admin/sub-category-collections/:id", adminAuth, getSubCategoryCollectionById);

// Update collection
router.patch("/admin/sub-category-collections/:id", adminAuth, updateSubCategoryCollection);

// Delete collection
router.delete("/admin/sub-category-collections/:id", adminAuth, deleteSubCategoryCollection);

// Add multiple assets to a collection
router.post(
  "/admin/sub-category-collections/:id/assets",
  adminAuth,
  (req, res, next) => {
    req.body.collectionId = req.params.id;
    next();
  },
  addAssetsToCollection
);

// Remove single asset from collection
router.delete(
  "/admin/sub-category-collections/:id/assets/:assetId",
  adminAuth,
  removeAssetFromCollection
);

/**
 * PUBLIC ROUTES (no conflict with user /collections)
 */

// List collections (e.g. for homepage, filters)
//   /subcategory-collections?parent=Image&isTrending=true
router.get("/subcategory-collections", getSubCategoryCollections);

// Get one collection by slug or id for /collection/:slug
router.get("/subcategory-collections/:slug", getSubCategoryCollectionBySlug);

// Helper endpoint for HomeBanner1 to get top collections for a parent category
router.get("/subcategory-collections-top", getTopCollectionsForParent);

// Note: we no longer expose /collections or /collections/addAsset here to avoid
// clashing with existing user collection routes in routes/index.js.

export default router;
