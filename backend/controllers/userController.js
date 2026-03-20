const User = require('../models/User');
const Post = require('../models/Post');

async function getUserStatus(req, res, next) {
  try {
    const authUserId = req.user?.userId;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(authUserId);

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    return res.json({
      banned: user.isBanned,
      violations: user.violations,
    });
  } catch (error) {
    return next(error);
  }
}

async function getUserProfile(req, res, next) {
  try {
    const authUserId = req.user?.userId;
    console.log('[getUserProfile] Authenticated userId:', authUserId);

    if (!authUserId) {
      console.log('[getUserProfile] No userId in token');
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(authUserId);
    console.log('[getUserProfile] User found:', user ? user.username : 'null');

    if (!user) {
      console.log('[getUserProfile] User not found in database');
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    const posts = await Post.find({ userId: authUserId })
      .sort({ createdAt: -1 })
      .select({ _id: 1, imageBase64: 1, caption: 1, createdAt: 1 });

    const normalizedPosts = posts.map((post) => ({
      id: post._id.toString(),
      imageBase64: post.imageBase64,
      caption: post.caption,
      timestamp: post.createdAt.toISOString(),
    }));

    return res.json({
      user: {
        userId: user._id.toString(),
        username: user.username,
        createdAt: user.createdAt,
        postCount: posts.length,
        violations: user.violations,
      },
      posts: normalizedPosts,
    });
  } catch (error) {
    return next(error);
  }
}

async function getUserProfileByUsername(req, res, next) {
  try {
    const { username } = req.params;
    const authUserId = req.user?.userId;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    const posts = await Post.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .select({ _id: 1, imageBase64: 1, caption: 1, createdAt: 1 });

    const normalizedPosts = posts.map((post) => ({
      id: post._id.toString(),
      imageBase64: post.imageBase64,
      caption: post.caption,
      timestamp: post.createdAt.toISOString(),
    }));

    const isOwnProfile = user._id.toString() === authUserId;

    return res.json({
      user: {
        userId: user._id.toString(),
        username: user.username,
        createdAt: user.createdAt,
        postCount: posts.length,
        ...(isOwnProfile && { violations: user.violations }),
      },
      posts: normalizedPosts,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUserStatus,
  getUserProfile,
  getUserProfileByUsername,
};
