import mongoose from "mongoose";

const { Schema } = mongoose;

const creatorHistorySchema = new Schema(
  {
    status: { type: String, enum: ['not-applied', 'pending', 'approved', 'rejected'], required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'users', default: null },
    reason: { type: String, default: null },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const creatorSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true, unique: true },
    status: { type: String, enum: ['not-applied', 'pending', 'approved', 'rejected'], default: 'not-applied' },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    profile: {
      displayName: { type: String, default: null },
      bio: { type: String, default: null },
      website: { type: String, default: null },
      portfolioLinks: { type: [String], default: [] },
      socialLinks: { type: [String], default: [] },
      country: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      zipCode: { type: String, default: null },
      gender: { type: String, default: null },
      dob: { type: String, default: null },
      phone: { type: String, default: null },
      profession: { type: String, default: null },
      skills: { type: [String], default: [] },
      attachments: { type: [String], default: [] },
      // Professional profile image for creator (S3)
      profileImage: {
        url: { type: String, default: null },
        s3Key: { type: String, default: null },
        uploadedAt: { type: Date, default: null },
        fileSize: { type: Number, default: null },
        mimeType: { type: String, default: null }
      },
    },
    appliedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'users', default: null },
    rejectionReason: { type: String, default: null },
    history: { type: [creatorHistorySchema], default: [] },
  },
  { timestamps: true }
);

creatorSchema.index({ userId: 1 }, { unique: true });
creatorSchema.index({ status: 1 });
creatorSchema.index({ createdAt: -1 });

const creatorsModule = mongoose.model('creators', creatorSchema);

export default creatorsModule;
