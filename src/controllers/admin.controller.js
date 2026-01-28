import jwt from "jsonwebtoken";
import serverConfig from "../config/server.config.js";
import db from '../modules/index.js';
import { compareHash } from '../utils/hash.util.js';

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await db.users.findOne({ email, role: 'admin', accountStatus: 'active' });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }
    const isMatch = await compareHash(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }
    const token = jwt.sign({ email: admin.email, isAdmin: true, id: admin._id }, serverConfig.secretKey, { expiresIn: "1d" });
    return res.json({ success: true, token });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
import {
  getAllUsers,
  getAllCreators,
  getAllImages,
  deleteUserById,
  deleteCreatorById,
  updateCreatorStatusById,
  getAnalytics,
  getAllCategories,
  addCategory as addCategoryService,
  updateCategoryById,
  deleteCategoryById,
  getFlaggedContent
} from '../services/admin.services.js';
import { updateImageStatusById } from '../services/images.services.js';

export const listAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers(req.query);
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listAllCreators = async (req, res) => {
  try {
    const creators = await getAllCreators(req.query);
    res.json({ success: true, data: creators });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listAllImages = async (req, res) => {
  try {
    const images = await getAllImages(req.query);
    res.json({ success: true, data: images });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateImageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const result = await updateImageStatusById(id, status, reason);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteUserById(id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteCreatorById(id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCreatorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const result = await updateCreatorStatusById(id, status, reason);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    const analytics = await getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listCategories = async (req, res) => {
  try {
    const categories = await getAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addCategory = async (req, res) => {
  try {
    const result = await addCategoryService(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateCategoryById(id, req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteCategoryById(id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listFlaggedContent = async (req, res) => {
  try {
    const flagged = await getFlaggedContent();
    res.json({ success: true, data: flagged });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
