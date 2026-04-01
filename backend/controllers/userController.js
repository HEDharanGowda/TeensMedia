const User = require('../models/User');
const Post = require('../models/Post');
const { uploadBase64Image, deleteObject, getKeyFromUrl, getSignedUrlForUrl } = require('../services/storageService');
const { analyzeImageSafety } = require('../services/visionService');
const { EXPLICIT_LEVEL, QUESTIONABLE_LEVEL } = require('../config/moderation');

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
      .select({ _id: 1, imageUrl: 1, imageBase64: 1, caption: 1, createdAt: 1 });

    const normalizedPosts = await Promise.all(
      posts.map(async (post) => ({
        id: post._id.toString(),
        imageUrl: await getSignedUrlForUrl(post.imageUrl),
        imageBase64: post.imageBase64,
        caption: post.caption,
        timestamp: post.createdAt.toISOString(),
      }))
    );

    return res.json({
      user: {
        userId: user._id.toString(),
        username: user.username,
        profilePicture: await getSignedUrlForUrl(user.profilePicture),
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
      .select({ _id: 1, imageUrl: 1, imageBase64: 1, caption: 1, createdAt: 1 });

    const normalizedPosts = await Promise.all(
      posts.map(async (post) => ({
        id: post._id.toString(),
        imageUrl: await getSignedUrlForUrl(post.imageUrl),
        imageBase64: post.imageBase64,
        caption: post.caption,
        timestamp: post.createdAt.toISOString(),
      }))
    );

    const isOwnProfile = user._id.toString() === authUserId;
    const isFollowing = currentUser?.following?.includes(user._id) || false;

    return res.json({
      user: {
        userId: user._id.toString(),
        username: user.username,
        profilePicture: await getSignedUrlForUrl(user.profilePicture),
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

async function updateProfilePicture(req, res, next) {
  try {
    const authUserId = req.user?.userId;
    const { profilePicture } = req.body;

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

    const buffer = Buffer.from(profilePicture, 'base64');
    const MAX_BYTES = 8 * 1024 * 1024; // 8MB decoded

    if (!buffer.length || buffer.length > MAX_BYTES) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Profile picture is too large or invalid',
      });
    }

    // Run SafeSearch moderation
    const { adult, racy } = await analyzeImageSafety(profilePicture);
    const isExplicit = adult === EXPLICIT_LEVEL || racy === EXPLICIT_LEVEL;
    const isQuestionable = adult === QUESTIONABLE_LEVEL || racy === QUESTIONABLE_LEVEL;

    if (isExplicit) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Profile picture rejected due to explicit content',
      });
    }

    if (isQuestionable) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Profile picture flagged; please choose a different image',
      });
    }

    const { imageUrl } = await uploadBase64Image(profilePicture, `profiles/${authUserId}`);

    // delete previous avatar if it was a URL
    if (user.profilePicture) {
      const oldKey = getKeyFromUrl(user.profilePicture);
      if (oldKey) {
        await deleteObject(oldKey);
      }
    }

    user.profilePicture = imageUrl;
    await user.save();

    return res.json({
      status: 'OK',
      profilePicture: await getSignedUrlForUrl(imageUrl),
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
  updateProfilePicture,
};
