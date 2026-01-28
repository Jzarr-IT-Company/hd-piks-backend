import db from "../modules/index.js";

const { creators: Creators, users: Users } = db;

const normalizeLinks = (links = []) => {
  if (!Array.isArray(links)) return [];
  return [...new Set(links.filter(Boolean).map((l) => l.toString().trim()))];
};

const applyCreator = async (userId, profile = {}) => {
  const existing = await Creators.findOne({ userId });
  const now = new Date();

  if (existing && ['pending', 'approved'].includes(existing.status)) {
    const err = new Error('Application already in progress or approved');
    err.status = 409;
    throw err;
  }

  const baseProfile = existing?.profile || {};
  const mergedProfile = {
    ...baseProfile,
    ...profile,
    portfolioLinks: normalizeLinks(profile.portfolioLinks || baseProfile.portfolioLinks),
    socialLinks: normalizeLinks(profile.socialLinks || baseProfile.socialLinks),
  };

  const historyEntry = { status: 'pending', actor: userId, reason: null, at: now };

  let doc;
  if (!existing) {
    doc = await Creators.create({
      userId,
      status: 'pending',
      profile: mergedProfile,
      appliedAt: now,
      reviewedAt: null,
      reviewerId: null,
      rejectionReason: null,
      history: [historyEntry],
    });
  } else {
    existing.status = 'pending';
    existing.profile = mergedProfile;
    existing.appliedAt = now;
    existing.reviewedAt = null;
    existing.reviewerId = null;
    existing.rejectionReason = null;
    existing.history = [...(existing.history || []), historyEntry];
    doc = await existing.save();
  }

  // Link creatorId on user
  await Users.findByIdAndUpdate(userId, { creatorId: doc._id });

  return doc;
};

const getCreatorByUser = async (userId) => {
  return Creators.findOne({ userId });
};

const updateCreatorStatus = async ({ userId, status, reviewerId, reason }) => {
  const creator = await Creators.findOne({ userId });
  if (!creator) {
    const err = new Error('Creator record not found');
    err.status = 404;
    throw err;
  }

  const now = new Date();
  creator.status = status;
  creator.reviewedAt = now;
  creator.reviewerId = reviewerId;
  creator.rejectionReason = status === 'rejected' ? reason || null : null;
  creator.history = [...(creator.history || []), { status, actor: reviewerId, reason: creator.rejectionReason, at: now }];

  await creator.save();

  if (status === 'approved') {
    await Users.findByIdAndUpdate(userId, { role: 'creator', creatorId: creator._id });
  }

  return creator;
};

const getAllCreators = async () => {
  return Creators.find({});
};

export { applyCreator, getCreatorByUser, updateCreatorStatus, getAllCreators };
