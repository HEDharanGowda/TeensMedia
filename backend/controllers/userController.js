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
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
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

    const [user, currentUser] = await Promise.all([
      User.findOne({ username }),
      User.findById(authUserId),
    ]);

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
    const isFollowing = currentUser?.following?.includes(user._id) || false;

    return res.json({
      user: {
        userId: user._id.toString(),
        username: user.username,
        createdAt: user.createdAt,
        postCount: posts.length,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        isFollowing,
        ...(isOwnProfile && { violations: user.violations }),
      },
      posts: normalizedPosts,
    });
  } catch (error) {
    return next(error);
  }
}

async function searchUsers(req, res, next) {
  try {
    const authUserId = req.user?.userId;
    const { q } = req.query;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      username: { $regex: q.trim(), $options: 'i' },
      _id: { $ne: authUserId },
    })
      .limit(10)
      .select('username _id');

    const results = users.map((user) => ({
      userId: user._id.toString(),
      username: user.username,
    }));

    return res.json(results);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUserStatus,
  getUserProfile,
  getUserProfileByUsername,
  searchUsers,
};
