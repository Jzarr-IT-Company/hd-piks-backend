
// Get blog by slug, with optional filter (e.g. status), and populate categories and their parent (for subcategories)
export const getBlogBySlug = async (slug, filter = {}) => {
  return await Blog.findOne({ slug, ...filter })
    .populate({
      path: 'categories',
      populate: { path: 'parent', model: 'blog_categories' }
    });
};

import { Blog } from '../modules/blog.module.js';

export const createBlog = async (data) => {
  // Check for duplicate slug
  const existing = await Blog.findOne({ slug: data.slug });
  if (existing) {
    throw new Error('A blog with this slug already exists. Please choose a unique slug.');
  }
  const blog = new Blog(data);
  return await blog.save();
};

export const getBlogs = async (filter = {}, options = {}) => {
  return await Blog.find(filter, null, options)
    .populate({
      path: 'categories',
      populate: { path: 'parent', model: 'blog_categories' }
    })
    .sort({ createdAt: -1 });
};

export const getBlogById = async (id) => {
  return await Blog.findById(id);
};


export const updateBlog = async (id, data) => {
  if (data.slug) {
    // Check for duplicate slug (exclude current blog)
    const existing = await Blog.findOne({ slug: data.slug, _id: { $ne: id } });
    if (existing) {
      throw new Error('A blog with this slug already exists. Please choose a unique slug.');
    }
  }
  return await Blog.findByIdAndUpdate(id, data, { new: true });
};

export const deleteBlog = async (id) => {
  return await Blog.findByIdAndDelete(id);
};
