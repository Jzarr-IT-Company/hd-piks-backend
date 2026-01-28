import { createCategory, getCategoryTree, updateCategory, deleteCategory } from '../services/category.services.js';

export const createCategoryController = async (req, res) => {
  try {
    const { name, parent, status } = req.body;
    const createdBy = req.user?._id;
    const category = await createCategory({ name, parent, status, createdBy });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCategoryTreeController = async (req, res) => {
  try {
    const tree = await getCategoryTree();
    res.json({ success: true, data: tree });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, parent } = req.body;
    const updated = await updateCategory(id, { name, status, parent });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCategory(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
