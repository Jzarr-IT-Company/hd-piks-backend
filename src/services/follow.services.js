
import db from '../modules/index.js';
const { users: Users, creators: Creators, Follow } = { ...db, Follow: (await import('../modules/follow.module.js')).default };

async function followUser(followerId, followingId) {
  if (followerId === followingId) {
    throw new Error('You cannot follow yourself.');
  }
  const follower = await Users.findById(followerId);
  const following = await Users.findById(followingId);
  if (!follower || !following) {
    throw new Error('User not found.');
  }
  let followerCreator = null;
  let followingCreator = null;
  if (follower.role === 'creator') {
    followerCreator = await Creators.findOne({ userId: followerId });
    if (!followerCreator) throw new Error('Creator profile not found for follower.');
  }
  if (following.role === 'creator') {
    followingCreator = await Creators.findOne({ userId: followingId });
    if (!followingCreator) throw new Error('Creator profile not found for following.');
  }
  // Only allow user->creator or creator->creator
  if (follower.role === 'user' && following.role !== 'creator') {
    throw new Error('Users can only follow creators.');
  }
  if (follower.role === 'creator' && following.role !== 'creator') {
    throw new Error('Creators can only follow other creators.');
  }
  // Prevent duplicate follows
  const exists = await Follow.findOne({
    followerUser: followerId,
    followingUser: followingId
  });
  if (exists) {
    throw new Error('Already following.');
  }
  const followDoc = await Follow.create({
    followerUser: followerId,
    followerCreator: followerCreator?._id || null,
    followingUser: followingId,
    followingCreator: followingCreator?._id || null
  });
  // Increment followingCount for follower (user and creator if exists)
  await Users.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
  if (followerCreator) {
    await Creators.findByIdAndUpdate(followerCreator._id, { $inc: { followingCount: 1 } });
  }
  // Increment followersCount for following (user and creator if exists)
  await Users.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } });
  if (followingCreator) {
    await Creators.findByIdAndUpdate(followingCreator._id, { $inc: { followersCount: 1 } });
  }
  return followDoc;
}

async function unfollowUser(followerId, followingId) {
  const followDoc = await Follow.findOneAndDelete({ followerUser: followerId, followingUser: followingId });
  if (followDoc) {
    // Decrement followingCount for follower (user and creator if exists)
    await Users.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
    if (followDoc.followerCreator) {
      await Creators.findByIdAndUpdate(followDoc.followerCreator, { $inc: { followingCount: -1 } });
    }
    // Decrement followersCount for following (user and creator if exists)
    await Users.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });
    if (followDoc.followingCreator) {
      await Creators.findByIdAndUpdate(followDoc.followingCreator, { $inc: { followersCount: -1 } });
    }
  }
  return followDoc;
}

async function getFollowers(userId) {
  return Follow.find({ followingUser: userId })
    .populate('followerUser')
    .populate('followerCreator');
}

async function getFollowing(userId) {
  return Follow.find({ followerUser: userId })
    .populate('followingUser')
    .populate('followingCreator');
}

export default {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
