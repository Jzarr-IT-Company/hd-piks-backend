import mongoose from "mongoose";

const { Schema } = mongoose;

const imagesSchema = new Schema({
    // Main Image URL (can be S3, CloudFront, or CDN URL)
    imageUrl: {
        type: String,
        required: true
    },
    
    // AWS S3 Storage Fields
    s3Key: {
        type: String,
        default: null,
        index: true  // Index for faster S3 operations
    },
    s3Url: {
        type: String,
        default: null  // Direct S3 URL for downloads/access
    },
    
    // Category Classification (references to Category model)
    category: {
        type: Schema.Types.ObjectId,
        ref: 'categories',
        required: true,
        index: true
    },
    subcategory: {
        type: Schema.Types.ObjectId,
        ref: 'categories',
        default: null,
        index: true
    },
    subsubcategory: {
        type: Schema.Types.ObjectId,
        ref: 'categories',
        default: null
    },
    
    // Content Details
    title: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    keywords: {
        type: [String],
        default: [],
        index: true
    },
    
    // Pricing & Access
    freePremium: {
        type: String,
        default: null,
        enum: ['free', 'premium', null]
    },
    
    // Legacy File Properties (keep for backward compatibility)
    imagesize: {
        type: String,
        default: null
    },
    imagetype: {
        type: String,
        default: null
    },
    
    // File Metadata (Enhanced)
    fileMetadata: {
        mimeType: {
            type: String,
            default: null  // e.g., "image/jpeg", "video/mp4"
        },
        fileSize: {
            type: Number,
            default: null  // Size in bytes
        },
        fileSizeFormatted: {
            type: String,
            default: null  // e.g., "2.5 MB"
        },
        dimensions: {
            width: {
                type: Number,
                default: null
            },
            height: {
                type: Number,
                default: null
            }
        },
        duration: {
            type: Number,
            default: null  // For videos, in seconds
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            default: null
        }
    },
    
    // Media Variants (for responsive images)
    mediaVariants: {
        type: [{
            variant: {
                type: String,
                enum: ['thumbnail', 'small', 'medium', 'large', 'original']
            },
            url: String,
            s3Key: String,
            dimensions: {
                width: Number,
                height: Number
            },
            fileSize: Number
        }],
        default: []
    },
    
    // Expiration
    expireimagedate: {
        type: String,
        default: null
    },
    
    // Associated Files (PSD, Mockups, etc.)
    zipfolder: {
        type: [Object],
        default: []
    },
    zipfolderurl: {
        type: String,
        default: null
    },
    
    // Legacy imageData (keep for backward compatibility)
    imageData: {
        type: [Object],
        default: []
    },
    
    // Legal & Permissions
    termsConditions: {
        type: Boolean,
        default: false
    },
    permissionLetter: {
        type: Boolean,
        default: false
    },
    
    // Moderation Status
    approved: {
        type: Boolean,
        default: false,
        index: true
    },
    rejected: {
        type: Boolean,
        default: false
    },
    rejectionReason: {
        type: String,
        default: null
    },
    
    // Creator Reference
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'creators',
        required: true,
        index: true
    },
    // User Reference (legacy, to be removed after migration)
    // userId: {
    //     type: String,
    //     required: false,
    //     index: true
    // },
    
    // Engagement Metrics
    views: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    
    // Tags & Organization
    tags: {
        type: [String],
        default: []
    },
    collections: {
        type: [Schema.Types.ObjectId],
        ref: 'collections',
        default: []
    }
}, { timestamps: true })

// Create text indexes on multiple fields
imagesSchema.index({
    category: 'text',
    subcategory: 'text',
    subsubcategory: 'text',
    title: 'text',
    description: 'text',
    keywords: 'text'
});
const imagesModule = mongoose.model('allImages', imagesSchema);

export default imagesModule;