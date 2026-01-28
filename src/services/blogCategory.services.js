import { BlogCategory } from '../modules/blog.module.js';

export const createBlogCategory = async (data) => {
  const category = new BlogCategory(data);
  return await category.save();
};

export const getBlogCategories = async () => {
  return await BlogCategory.find().sort({ order: 1, name: 1 });
};

export const updateBlogCategory = async (id, data) => {
  return await BlogCategory.findByIdAndUpdate(id, data, { new: true });
};

export const deleteBlogCategory = async (id) => {
  return await BlogCategory.findByIdAndDelete(id);
};
