import mongoose from "mongoose";

const { Schema } = mongoose;

const subCategoryCollectionSchema = new Schema({
    // Parent top-level category (Image, Video, Mockups, etc.)
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: "categories",
        required: true,
    },
    // The subcategory under that parent (wallpapers, nature, Business, etc.)
    subcategory: {
        type: Schema.Types.ObjectId,
        ref: "categories",
        required: true,
    },

    // Display name for this collection (e.g. "Top Wallpapers")
    name: {
        type: String,
        required: true,
        trim: true,
    },

    // Slug used in /collection/:slug (e.g. "top-wallpapers")
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },

    description: {
        type: String,
        trim: true,
    },

    // Should this collection appear in HomeBanner1 as "top trending"
    isTrending: {
        type: Boolean,
        default: false,
        index: true,
    },

    // Assigned assets (images/videos) explicitly added to this collection
    assetIds: [
        {
            type: Schema.Types.ObjectId,
            ref: "allImages",          
        },
    ],

    // Optional primary asset to use as card cover
    coverAsset: {
        type: Schema.Types.ObjectId,
        ref: "allImages",             
    },

    // Fallback cover image URL if you want a custom hero, not tied to a single asset
    coverImageUrl: {
        type: String,
        trim: true,
    },

    sortOrder: {
        type: Number,
        default: 0,
    },

    active: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const subCategoryCollectionModule = mongoose.model(
    "subCategoryCollections",
    subCategoryCollectionSchema
);

export default subCategoryCollectionModule;
