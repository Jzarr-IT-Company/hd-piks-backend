import mongoose from 'mongoose';

const BlogCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'blog_categories', default: null },
  slug: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const MediaSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video', 'pdf', 'spreadsheet', 'zip', 'other'], required: true },
  url: { type: String, required: true },
  alt: String,
  caption: String
}, { _id: false });

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  media: [MediaSchema],
  featureImage: { type: String },
  seoTitle: { type: String },
  metaDescription: { type: String },
  breadcrumbsTitle: { type: String },
  canonicalUrl: { type: String },
  tags: [{ type: String }],
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'blog_categories' }],
  schemaCode: { type: String }, // JSON-LD or script
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  status: { type: String, enum: ['draft', 'published', 'scheduled', 'archived'], default: 'draft' },
  publishedAt: { type: Date },
  isFeatured: { type: Boolean, default: false },
  allowComments: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  attachments: [{ type: String }],
  readingTime: { type: Number },
  language: { type: String, default: 'en' },
  customFields: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export const Blog = mongoose.model('blogs', BlogSchema);
export const BlogCategory = mongoose.model('blog_categories', BlogCategorySchema);
