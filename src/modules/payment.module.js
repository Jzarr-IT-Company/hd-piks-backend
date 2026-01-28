import mongoose from "mongoose";

const { Schema } = mongoose;

const paymentSchema = new Schema({
    // Payment related image (receipt, invoice, profile)
    image: {
        url: {
            type: String,
            default: null
        },
        s3Key: {
            type: String,
            default: null  // For S3 deletion if needed
        },
        type: {
            type: String,
            enum: ['profile', 'receipt', 'invoice', null],
            default: null
        },
        uploadedAt: {
            type: Date,
            default: null
        }
    },
    email: {
        type: String,
        required: true,
        index: true
    },
    phone: {
        type: String,
        default: null
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'PKR',
        enum: ['PKR', 'USD', 'EUR']
    },
    name: {
        type: String,
        required: true
    },
    coursesname: {
        type: [String],
        default: []
    },
    id: {
        type: String,
        default: null  // External payment ID (Stripe, JazzCash)
    },
    paymenttype: {
        type: String,
        enum: ['stripe', 'jazzcash', 'card', 'other'],
        default: null
    },
    promocode: {
        type: String,
        default: null
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
        index: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    // Transaction details
    transactionId: {
        type: String,
        unique: true,
        sparse: true  // Allows null values while maintaining uniqueness
    },
    paymentDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

// Add indexes for common queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ email: 1, createdAt: -1 });
paymentSchema.index({ paymentStatus: 1, createdAt: -1 });

const paymentModule = mongoose.model("Singlepayments", paymentSchema);

export default paymentModule;