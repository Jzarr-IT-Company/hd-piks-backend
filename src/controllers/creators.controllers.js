// Save S3 profile image URL to creator profile
import db from '../modules/index.js';
export const saveCreatorProfileImageUrl = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user._id) {
      return res.status(401).json({ status: 401, success: false, message: 'unauthorized' });
    }
    const { s3Url, s3Key, fileSize, mimeType } = req.body;
    if (!s3Url || !s3Key) {
      return res.status(400).json({ status: 400, success: false, message: 's3Url and s3Key are required' });
    }
    const Creators = db.creators;
    const creator = await Creators.findOne({ userId: user._id });
    if (!creator) {
      return res.status(404).json({ status: 404, success: false, message: 'creator profile not found' });
    }
    creator.profile.profileImage = {
      url: s3Url,
      s3Key,
      uploadedAt: new Date(),
      fileSize: fileSize || null,
      mimeType: mimeType || null
    };
    await creator.save();
    return res.status(200).json({ status: 200, success: true, message: 'Creator profile image URL saved successfully' });
  } catch (error) {
    console.error('Error saving creator profile image URL:', error);
    return res.status(500).json({ status: 500, success: false, message: 'Error saving creator profile image URL', error: error.message });
  }
};
import { applyCreator, getCreatorByUser, updateCreatorStatus, getAllCreators } from '../services/creators.services.js';

const applyCreatorController = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ status: 401, success: false, message: 'unauthorized' });
    }

    const rawProfile = req.body?.contributorProfile || req.body?.profile || {};
    const displayName = rawProfile.displayName || user.name;
    const mergedLinks = Array.isArray(rawProfile.socialMediaLinks)
      ? rawProfile.socialMediaLinks
          .map((item) => (typeof item === 'string' ? item : item?.url))
          .filter(Boolean)
      : [];
    const socialLinks = rawProfile.socialLinks || mergedLinks;
    const portfolioLinks = [rawProfile.website, ...(rawProfile.portfolioLinks || []), ...socialLinks]
      .filter(Boolean)
      .map((url) => url.toString().trim());

    const response = await applyCreator(user._id, {
      ...rawProfile,
      displayName,
      portfolioLinks,
      socialLinks,
    });
    return res.status(200).json({ status: 200, success: true, data: response });
  } catch (error) {
    const code = error.status || 500;
    return res.status(code).json({ status: code, success: false, message: error.message });
  }
};

const getMyCreatorController = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ status: 401, success: false, message: 'unauthorized' });
    }
    const response = await getCreatorByUser(user._id);
    return res.status(200).json({ status: 200, success: true, data: response });
  } catch (error) {
    return res.status(500).json({ status: 500, success: false, message: error.message });
  }
};

const updateCreatorStatusController = async (req, res) => {
  try {
    const adminUser = req.user;
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ status: 403, success: false, message: 'forbidden' });
    }

    const { userId, status, reason } = req.body;
    if (!userId || !status) {
      return res.status(400).json({ status: 400, success: false, message: 'userId and status are required' });
    }

    const response = await updateCreatorStatus({ userId, status, reviewerId: adminUser._id, reason });
    return res.status(200).json({ status: 200, success: true, data: response });
  } catch (error) {
    const code = error.status || 500;
    return res.status(code).json({ status: code, success: false, message: error.message });
  }
};

const getAllCreatorsController = async (req, res) => {
  try {
    const creators = await getAllCreators();
    return res.status(200).json({ status: 200, success: true, data: creators });
  } catch (error) {
    return res.status(500).json({ status: 500, success: false, message: error.message });
  }
};

// Update creator profile (PATCH /creator/me)
export const updateMyCreatorProfileController = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ status: 401, success: false, message: 'unauthorized' });
    }
    const profileUpdates = req.body;
    const Creators = db.creators;
    const creator = await Creators.findOne({ userId: user._id });
    if (!creator) {
      return res.status(404).json({ status: 404, success: false, message: 'creator profile not found' });
    }
    // Only update allowed fields in profile
    const allowedFields = [
      'displayName','bio','website','portfolioLinks','socialLinks','country','city','state','zipCode','gender','dob','phone','profession','skills','attachments','profileImage'
    ];
    for (const key of allowedFields) {
      if (profileUpdates[key] !== undefined) {
        creator.profile[key] = profileUpdates[key];
      }
    }
    await creator.save();
    return res.status(200).json({ status: 200, success: true, data: creator });
  } catch (error) {
    return res.status(500).json({ status: 500, success: false, message: error.message });
  }
};

export { applyCreatorController, getMyCreatorController, updateCreatorStatusController, getAllCreatorsController };
