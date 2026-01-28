import db from '../modules/index.js';
const { users: Users, creators: Creators, images: Images, categories: Categories, flagged: Flagged } = db;

export const getAllUsers = async (query = {}) => {
  // Add pagination, search, filter logic as needed
  return Users.find({}).exec();
};

export const getAllCreators = async (query = {}) => {
  return Creators.find({}).exec();
};

export const getAllImages = async (query = {}) => {
  // Add filter by category, subcategory, uploader, status
  return Images.find({}).exec();
};

export const updateImageStatusById = async (id, status, reason) => {
  return Images.findByIdAndUpdate(id, { status, rejectionReason: reason }, { new: true }).exec();
};

export const deleteUserById = async (id) => {
  return Users.findByIdAndDelete(id).exec();
};

export const deleteCreatorById = async (id) => {
  return Creators.findByIdAndDelete(id).exec();
};

export const updateCreatorStatusById = async (id, status, reason) => {
  return Creators.findByIdAndUpdate(id, { status, rejectionReason: reason }, { new: true }).exec();
};

export const getAnalytics = async () => {
  const userCount = await Users.countDocuments();
  const creatorCount = await Creators.countDocuments();
  const imageCount = await Images.countDocuments();
  const pendingImages = await Images.countDocuments({ status: 'pending' });
  return { userCount, creatorCount, imageCount, pendingImages };
};

export const getAllCategories = async () => {
  return Categories.find({}).exec();
};

export const addCategory = async (data) => {
  return Categories.create(data);
};

export const updateCategoryById = async (id, data) => {
  return Categories.findByIdAndUpdate(id, data, { new: true }).exec();
};

export const deleteCategoryById = async (id) => {
  return Categories.findByIdAndDelete(id).exec();
};

export const getFlaggedContent = async () => {
  return Flagged.find({}).exec();
};
