import followService from '../services/follow.services.js';
export const followUser = async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    const follow = await followService.followUser(followerId, followingId);
    res.status(201).json(follow);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    await followService.unfollowUser(followerId, followingId);
    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const followers = await followService.getFollowers(userId);
    res.status(200).json(followers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const following = await followService.getFollowing(userId);
    res.status(200).json(following);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

