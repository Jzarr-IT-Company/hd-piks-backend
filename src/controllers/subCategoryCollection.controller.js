import {
  createSubCategoryCollectionService,
  getSubCategoryCollectionsService,
  getSubCategoryCollectionByIdService,
  getSubCategoryCollectionBySlugService,
  updateSubCategoryCollectionService,
  deleteSubCategoryCollectionService,
  addAssetsToCollectionService,
  removeAssetFromCollectionService,
  getTopCollectionsForParentService,
} from "../services/subCategoryCollection.services.js";

// ADMIN: create collection
export const createSubCategoryCollection = async (req, res) => {
  try {
    const doc = await createSubCategoryCollectionService(req.body);
    return res.status(201).json({
      status: 201,
      success: true,
      data: doc,
    });
  } catch (err) {
    console.error("[subCategoryCollection] create error:", err);
    return res.status(400).json({
      status: 400,
      success: false,
      message: err.message || "Failed to create collection",
    });
  }
};

// ADMIN + PUBLIC: list collections (with filters)
export const getSubCategoryCollections = async (req, res) => {
  try {
    const docs = await getSubCategoryCollectionsService(req.query);
    return res.status(200).json({
      status: 200,
      success: true,
      data: docs,
    });
  } catch (err) {
    console.error("[subCategoryCollection] list error:", err);
    return res.status(500).json({
      status: 500,
      success: false,
      message: err.message || "Failed to fetch collections",
    });
  }
};

// ADMIN: get by id
export const getSubCategoryCollectionById = async (req, res) => {
  try {
    const doc = await getSubCategoryCollectionByIdService(req.params.id);
    return res.status(200).json({
      status: 200,
      success: true,
      data: doc,
    });
  } catch (err) {
    console.error("[subCategoryCollection] getById error:", err);
    const code = err.message === "Collection not found" ? 404 : 400;
    return res.status(code).json({
      status: code,
      success: false,
      message: err.message || "Failed to fetch collection",
    });
  }
};

// PUBLIC: get by slug (or id)
export const getSubCategoryCollectionBySlug = async (req, res) => {
  try {
    const doc = await getSubCategoryCollectionBySlugService(req.params.slug);
    return res.status(200).json({
      status: 200,
      success: true,
      data: doc,
    });
  } catch (err) {
    console.error("[subCategoryCollection] getBySlug error:", err);
    const code = err.message === "Collection not found" ? 404 : 400;
    return res.status(code).json({
      status: code,
      success: false,
      message: err.message || "Failed to fetch collection",
    });
  }
};

// ADMIN: update collection
export const updateSubCategoryCollection = async (req, res) => {
  try {
    const doc = await updateSubCategoryCollectionService(req.params.id, req.body);
    return res.status(200).json({
      status: 200,
      success: true,
      data: doc,
    });
  } catch (err) {
    console.error("[subCategoryCollection] update error:", err);
    const code = err.message === "Collection not found" ? 404 : 400;
    return res.status(code).json({
      status: code,
      success: false,
      message: err.message || "Failed to update collection",
    });
  }
};

// ADMIN: delete collection
export const deleteSubCategoryCollection = async (req, res) => {
  try {
    await deleteSubCategoryCollectionService(req.params.id);
    return res.status(200).json({
      status: 200,
      success: true,
      message: "Collection deleted",
    });
  } catch (err) {
    console.error("[subCategoryCollection] delete error:", err);
    const code = err.message === "Collection not found" ? 404 : 400;
    return res.status(code).json({
      status: code,
      success: false,
      message: err.message || "Failed to delete collection",
    });
  }
};

// ADMIN: add multiple assets to a collection
export const addAssetsToCollection = async (req, res) => {
  try {
    const { collectionId, assetIds } = req.body;
    if (!collectionId || !Array.isArray(assetIds)) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "collectionId and assetIds[] are required",
      });
    }
    const doc = await addAssetsToCollectionService(collectionId, assetIds);
    return res.status(200).json({
      status: 200,
      success: true,
      data: doc,
    });
  } catch (err) {
    console.error("[subCategoryCollection] addAssets error:", err);
    const code = err.message === "Collection not found" ? 404 : 400;
    return res.status(code).json({
      status: code,
      success: false,
      message: err.message || "Failed to add assets",
    });
  }
};

// ADMIN: remove single asset from collection
export const removeAssetFromCollection = async (req, res) => {
  try {
    const { id, assetId } = req.params;
    const doc = await removeAssetFromCollectionService(id, assetId);
    return res.status(200).json({
      status: 200,
      success: true,
      data: doc,
    });
  } catch (err) {
    console.error("[subCategoryCollection] removeAsset error:", err);
    const code = err.message === "Collection not found" ? 404 : 400;
    return res.status(code).json({
      status: code,
      success: false,
      message: err.message || "Failed to remove asset",
    });
  }
};

// PUBLIC: get top trending collections for a parent (for HomeBanner1)
export const getTopCollectionsForParent = async (req, res) => {
  try {
    const { parent = "Image", limit = 12 } = req.query;
    const docs = await getTopCollectionsForParentService(parent, limit);
    return res.status(200).json({
      status: 200,
      success: true,
      data: docs,
    });
  } catch (err) {
    console.error("[subCategoryCollection] topForParent error:", err);
    return res.status(500).json({
      status: 500,
      success: false,
      message: err.message || "Failed to fetch top collections",
    });
  }
};
