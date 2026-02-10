import mongoose from "mongoose";
import subCategoryCollectionModule from "../modules/subCategoryCollection.module.js";
import Category from "../modules/category.js";
import db from "../modules/index.js";

const { images: Images } = db;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const slugify = (val) =>
  (val || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Ensure parent & subcategory IDs exist and parent/child relationship is valid
const validateCategoryPair = async (parentCategory, subcategory) => {
  if (!isValidObjectId(parentCategory) || !isValidObjectId(subcategory)) {
    throw new Error("Invalid parentCategory or subcategory id");
  }

  const parent = await Category.findById(parentCategory);
  if (!parent || parent.parent !== null) {
    throw new Error("parentCategory must be a top-level category");
  }

  const child = await Category.findById(subcategory);
  if (!child || String(child.parent) !== String(parent._id)) {
    throw new Error("subcategory does not belong to the specified parentCategory");
  }
};

export const createSubCategoryCollectionService = async (payload) => {
  const {
    parentCategory,
    subcategory,
    name,
    slug,
    description,
    isTrending,
    assetIds = [],
    coverAsset,
    coverImageUrl,
    sortOrder,
    active,
  } = payload;

  await validateCategoryPair(parentCategory, subcategory);

  const collectionSlug = slug ? slugify(slug) : slugify(name);
  if (!collectionSlug) {
    throw new Error("Slug or valid name is required");
  }

  const existing = await subCategoryCollectionModule.findOne({ slug: collectionSlug });
  if (existing) {
    throw new Error("Slug already in use");
  }

  const uniqueAssetIds = Array.from(
    new Set(
      (assetIds || [])
        .filter(Boolean)
        .map((id) => id.toString())
    )
  );

  const doc = await subCategoryCollectionModule.create({
    parentCategory,
    subcategory,
    name,
    slug: collectionSlug,
    description: description || "",
    isTrending: !!isTrending,
    assetIds: uniqueAssetIds,
    coverAsset: coverAsset || null,
    coverImageUrl: coverImageUrl || "",
    sortOrder: sortOrder || 0,
    active: active !== undefined ? !!active : true,
  });

  return doc;
};

export const getSubCategoryCollectionsService = async (query = {}, options = {}) => {
  const {
    parent, // parent category name (e.g. "Image")
    parentId,
    subcategoryId,
    isTrending,
    active,
    limit,
    skip,
  } = query;

  const filter = {};

  // parent by id or by name
  if (parentId && isValidObjectId(parentId)) {
    filter.parentCategory = parentId;
  } else if (parent) {
    const parentDoc = await Category.findOne({
      name: new RegExp(`^${parent}$`, "i"),
      parent: null,
    });
    if (parentDoc) {
      filter.parentCategory = parentDoc._id;
    } else {
      // no such parent, return empty
      return [];
    }
  }

  if (subcategoryId && isValidObjectId(subcategoryId)) {
    filter.subcategory = subcategoryId;
  }

  if (isTrending !== undefined) {
    filter.isTrending = isTrending === "true" || isTrending === true;
  }

  if (active !== undefined) {
    filter.active = active === "true" || active === true;
  }

  const q = subCategoryCollectionModule
    .find(filter)
    .populate("parentCategory subcategory coverAsset assetIds")
    .sort({ sortOrder: 1, createdAt: -1 });

  if (skip) q.skip(Number(skip));
  if (limit) q.limit(Number(limit));

  const docs = await q.exec();
  return docs;
};

export const getSubCategoryCollectionByIdService = async (id) => {
  if (!isValidObjectId(id)) throw new Error("Invalid id");
  const doc = await subCategoryCollectionModule
    .findById(id)
    .populate("parentCategory subcategory coverAsset assetIds");
  if (!doc) throw new Error("Collection not found");
  return doc;
};

export const getSubCategoryCollectionBySlugService = async (slugOrId) => {
  let doc;
  if (isValidObjectId(slugOrId)) {
    doc = await subCategoryCollectionModule
      .findById(slugOrId)
      .populate("parentCategory subcategory coverAsset assetIds");
  } else {
    const safeSlug = slugify(slugOrId);
    doc = await subCategoryCollectionModule
      .findOne({ slug: safeSlug })
      .populate("parentCategory subcategory coverAsset assetIds");
  }
  if (!doc) throw new Error("Collection not found");
  return doc;
};

export const updateSubCategoryCollectionService = async (id, updates) => {
  if (!isValidObjectId(id)) throw new Error("Invalid id");

  const updateData = { ...updates };

  if (updateData.name && !updateData.slug) {
    updateData.slug = slugify(updateData.name);
  } else if (updateData.slug) {
    updateData.slug = slugify(updateData.slug);
  }

  if (updateData.parentCategory || updateData.subcategory) {
    const doc = await subCategoryCollectionModule.findById(id);
    if (!doc) throw new Error("Collection not found");
    await validateCategoryPair(
      updateData.parentCategory || doc.parentCategory,
      updateData.subcategory || doc.subcategory
    );
  }

  if (updateData.assetIds) {
    const uniqueAssetIds = Array.from(
      new Set(
        (updateData.assetIds || [])
          .filter(Boolean)
          .map((aid) => aid.toString())
      )
    );
    updateData.assetIds = uniqueAssetIds;
  }

  const updated = await subCategoryCollectionModule
    .findByIdAndUpdate(id, updateData, { new: true })
    .populate("parentCategory subcategory coverAsset assetIds");

  if (!updated) throw new Error("Collection not found");
  return updated;
};

export const deleteSubCategoryCollectionService = async (id) => {
  if (!isValidObjectId(id)) throw new Error("Invalid id");
  const deleted = await subCategoryCollectionModule.findByIdAndDelete(id);
  if (!deleted) throw new Error("Collection not found");
  return true;
};

export const addAssetsToCollectionService = async (id, assetIds = []) => {
  if (!isValidObjectId(id)) throw new Error("Invalid id");
  const uniqueAssetIds = Array.from(
    new Set(
      (assetIds || [])
        .filter(Boolean)
        .map((aid) => aid.toString())
    )
  );

  if (!uniqueAssetIds.length) return getSubCategoryCollectionByIdService(id);

  const updated = await subCategoryCollectionModule
    .findByIdAndUpdate(
      id,
      {
        $addToSet: {
          assetIds: { $each: uniqueAssetIds },
        },
      },
      { new: true }
    )
    .populate("parentCategory subcategory coverAsset assetIds");

  if (!updated) throw new Error("Collection not found");
  return updated;
};

export const removeAssetFromCollectionService = async (id, assetId) => {
  if (!isValidObjectId(id) || !isValidObjectId(assetId)) {
    throw new Error("Invalid id");
  }

  const updated = await subCategoryCollectionModule
    .findByIdAndUpdate(
      id,
      { $pull: { assetIds: assetId } },
      { new: true }
    )
    .populate("parentCategory subcategory coverAsset assetIds");

  if (!updated) throw new Error("Collection not found");
  return updated;
};

// Helper for HomeBanner1: get trending collections + minimal asset info
export const getTopCollectionsForParentService = async (parentName, limit = 12) => {
  const parentDoc = await Category.findOne({
    name: new RegExp(`^${parentName}$`, "i"),
    parent: null,
  });

  if (!parentDoc) return [];

  const collections = await subCategoryCollectionModule
    .find({
      parentCategory: parentDoc._id,
      isTrending: true,
      active: true,
    })
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(Number(limit) || 12)
    .populate("parentCategory subcategory coverAsset assetIds");

  return collections;
};
