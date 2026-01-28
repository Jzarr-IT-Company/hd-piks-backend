import mongoose from "mongoose";

const { Schema } = mongoose;

const collectionSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: null },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    items: { type: [Schema.Types.ObjectId], ref: 'allImages', default: [] },
    coverUrl: { type: String, default: null }
}, { timestamps: true });

collectionSchema.index({ userId: 1, name: 1 });

const collectionsModule = mongoose.model('collections', collectionSchema);

export default collectionsModule;
