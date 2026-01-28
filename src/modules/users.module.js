import mongoose from "mongoose";

const { Schema } = mongoose;

const usersSchems = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    city: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', null],
        default: null
    },
    country: {
        type: String,
        default: null
    },
    // Enhanced Profile Image with S3 Tracking
    profileImage: {
        url: {
            type: String,
            default: null
        },
        s3Key: {
            type: String,
            default: null  // For S3 deletion operations
        },
        uploadedAt: {
            type: Date,
            default: null
        },
        fileSize: {
            type: Number,
            default: null  // Size in bytes
        },
        mimeType: {
            type: String,
            default: null
        }
    },
    Skills: {
        type: String,
        default: null
    },
    PortfolioLink: {
        type: String,
        default: null
    },
    SocialMediaLinks: {
        type: [Object],
        default: []
    },
    download:{
        type: Number,
        default: null
    },
    isActive: {
        type: Boolean,
        default: false
    },
    followersCount: {
        type: Number,
        default: 0
    },
    followingCount: {
        type: Number,
        default: 0
    },
    // User role and permissions
    role: {
        type: String,
        enum: ['user', 'creator', 'admin'],
        default: 'user'
    },
    // Link to dedicated creator record (see creators collection)
    creatorId: {
        type: Schema.Types.ObjectId,
        ref: 'creators',
        default: null,
        index: true
    },
    // Account status
    accountStatus: {
        type: String,
        enum: ['active', 'suspended', 'deleted'],
        default: 'active'
    }
}, { timestamps: true })

// Add indexes for performance
usersSchems.index({ email: 1 }, { unique: true });
usersSchems.index({ name: 1 });
usersSchems.index({ country: 1 });
usersSchems.index({ accountStatus: 1 });
usersSchems.index({ createdAt: -1 });

const usersModule = mongoose.model("users", usersSchems)


export default usersModule


