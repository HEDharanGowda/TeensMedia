const User = require('../models/User');

async function followUser(req, res, next) {
  try {
    const authUserId = req.user?.userId;
    const { userId: targetUserId } = req.params;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    if (authUserId === targetUserId) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'You cannot follow yourself',
      });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(authUserId),
      User.findById(targetUserId),
    ]);

    if (!currentUser) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    if (!targetUser) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Target user not found',
      });
    }

    // Check if already following
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'You are already following this user',
      });
    }

    // Add to following/followers
    currentUser.following.push(targetUserId);
    targetUser.followers.push(authUserId);

    await Promise.all([currentUser.save(), targetUser.save()]);

    return res.json({
      status: 'SUCCESS',
      message: `You are now following ${targetUser.username}`,
      isFollowing: true,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    return next(error);
  }
}

async function unfollowUser(req, res, next) {
  try {
    const authUserId = req.user?.userId;
    const { userId: targetUserId } = req.params;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    if (authUserId === targetUserId) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'You cannot unfollow yourself',
      });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(authUserId),
      User.findById(targetUserId),
    ]);

    if (!currentUser) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    if (!targetUser) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Target user not found',
      });
    }

    // Check if not following
    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'You are not following this user',
      });
    }

    // Remove from following/followers
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== authUserId
    );

    await Promise.all([currentUser.save(), targetUser.save()]);

    return res.json({
      status: 'SUCCESS',
      message: `You have unfollowed ${targetUser.username}`,
      isFollowing: false,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    return next(error);
  }
}

async function getFollowers(req, res, next) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('followers', 'username _id')
      .select('followers');

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    const followers = user.followers.map((follower) => ({
      userId: follower._id.toString(),
      username: follower.username,
    }));

    return res.json({
      count: followers.length,
      followers,
    });
  } catch (error) {
    return next(error);
  }
}

async function getFollowing(req, res, next) {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('following', 'username _id')
      .select('following');

    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    const following = user.following.map((followed) => ({
      userId: followed._id.toString(),
      username: followed.username,
    }));

    return res.json({
      count: following.length,
      following,
    });
  } catch (error) {
    return next(error);
  }
}

async function checkFollowStatus(req, res, next) {
  try {
    const authUserId = req.user?.userId;
    const { userId: targetUserId } = req.params;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    const currentUser = await User.findById(authUserId);

    if (!currentUser) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    return res.json({
      isFollowing,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
};
