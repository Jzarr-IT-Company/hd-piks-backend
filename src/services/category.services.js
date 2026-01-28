import Category from '../models/category.model.js';

export const createCategory = async ({ name, parent, status, createdBy }) => {
  return Category.create({ name, parent: parent || null, status: status || 'pending', createdBy });
};

export const getCategoryTree = async () => {
  const categories = await Category.find({ status: 'approved' }).lean();
  const map = {};
  categories.forEach(cat => (map[cat._id] = { ...cat, children: [] }));
  const tree = [];
  categories.forEach(cat => {
    if (cat.parent) map[cat.parent]?.children.push(map[cat._id]);
    else tree.push(map[cat._id]);
  });
  return tree;
};

export const updateCategory = async (id, { name, status, parent }) => {
  return Category.findByIdAndUpdate(id, { name, status, parent }, { new: true });
};

export const deleteCategory = async (id) => {
  return Category.findByIdAndDelete(id);
};
