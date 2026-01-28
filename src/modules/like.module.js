import mongoose from "mongoose";

const { Schema } = mongoose;

const likeSchema = new Schema({
    imageId: {
        type: Schema.Types.ObjectId,
        ref: 'allImages',
        required: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    }
}, { timestamps: true });

// Compound unique index: One user can like an image only once
likeSchema.index({ imageId: 1, userId: 1 }, { unique: true });

// Index for getting all likes by user
likeSchema.index({ userId: 1, createdAt: -1 });

// Index for getting all likes for an image
likeSchema.index({ imageId: 1, createdAt: -1 });

const likeModule = mongoose.model("likes", likeSchema);

export default likeModule;