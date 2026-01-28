import mongoose from "mongoose";

const { Schema } = mongoose;

const tokenSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

const tokenModule = mongoose.model("token", tokenSchema);

export default tokenModule;

