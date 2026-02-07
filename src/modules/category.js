import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', default: null },
  status: { type: String, enum: ['approved', 'pending'], default: 'approved' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// IMPORTANT: register with the name 'categories' to match refs/usage elsewhere
const Category = mongoose.model('categories', CategorySchema);

export default Category;
