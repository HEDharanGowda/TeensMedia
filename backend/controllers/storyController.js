const Story = require('../models/Story');
const User = require('../models/User');
const { analyzeImageSafety } = require('../services/visionService');
const {
  MAX_VIOLATIONS,
  EXPLICIT_LEVEL,
  QUESTIONABLE_LEVEL,
} = require('../config/moderation');

async function createStory(req, res, next) {
  try {
    const authUserId = req.user?.userId;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Image is required',
      });
    }

    // Check if user exists and is not banned
    const user = await User.findById(authUserId);
    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        status: 'BANNED',
        message: `Account disabled: ${MAX_VIOLATIONS}/${MAX_VIOLATIONS} violations`,
      });
    }

    // Run image through Google Vision SafeSearch moderation
    const { adult, racy } = await analyzeImageSafety(imageBase64);

    const isExplicit = adult === EXPLICIT_LEVEL || racy === EXPLICIT_LEVEL;
    const isQuestionable = adult === QUESTIONABLE_LEVEL || racy === QUESTIONABLE_LEVEL;

    if (isExplicit) {
      user.violations += 1;

      if (user.violations >= MAX_VIOLATIONS) {
        user.isBanned = true;
        await user.save();

        return res.json({
          status: 'BANNED',
          message: `Account disabled (${MAX_VIOLATIONS}/${MAX_VIOLATIONS} violations)`,
          violations: user.violations,
        });
      }

      await user.save();

      return res.json({
        status: 'REJECTED',
        message: `Story blocked (${user.violations}/${MAX_VIOLATIONS} violations)`,
        violations: user.violations,
      });
    }

    if (isQuestionable) {
      return res.json({
        status: 'FLAGGED',
        message: 'Story flagged for review - content may not be appropriate',
      });
    }

    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await Story.create({
      userId: authUserId,
      imageBase64,
      expiresAt,
    });

    return res.status(201).json({
      status: 'APPROVED',
      message: 'Story created successfully',
      story: {
        id: story._id.toString(),
        userId: story.userId.toString(),
        imageBase64: story.imageBase64,
        expiresAt: story.expiresAt.toISOString(),
        createdAt: story.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getStories(req, res, next) {
  try {
    const now = new Date();

    // Fetch only non-expired stories
    const stories = await Story.find({
      expiresAt: { $gt: now },
    })
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .select({ _id: 1, userId: 1, imageBase64: 1, createdAt: 1, expiresAt: 1 });

    // Group stories by user (most recent story per user)
    const userStoriesMap = new Map();

    stories.forEach((story) => {
      const userId = story.userId._id.toString();
      if (!userStoriesMap.has(userId)) {
        userStoriesMap.set(userId, {
          userId,
          username: story.userId.username,
          profilePicture: story.userId.profilePicture || null,
          stories: [],
        });
      }
      userStoriesMap.get(userId).stories.push({
        id: story._id.toString(),
        imageBase64: story.imageBase64,
        createdAt: story.createdAt.toISOString(),
        expiresAt: story.expiresAt.toISOString(),
      });
    });

    // Convert map to array
    const groupedStories = Array.from(userStoriesMap.values());

    return res.json(groupedStories);
  } catch (error) {
    return next(error);
  }
}

async function getUserStories(req, res, next) {
  try {
    const { username } = req.params;
    const now = new Date();

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    const stories = await Story.find({
      userId: user._id,
      expiresAt: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .select({ _id: 1, imageBase64: 1, createdAt: 1, expiresAt: 1 });

    const normalizedStories = stories.map((story) => ({
      id: story._id.toString(),
      imageBase64: story.imageBase64,
      createdAt: story.createdAt.toISOString(),
      expiresAt: story.expiresAt.toISOString(),
    }));

    return res.json({
      username: user.username,
      userId: user._id.toString(),
      stories: normalizedStories,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteStory(req, res, next) {
  try {
    const authUserId = req.user?.userId;
    const { storyId } = req.params;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Story not found',
      });
    }

    if (story.userId.toString() !== authUserId) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'You can only delete your own stories',
      });
    }

    await Story.deleteOne({ _id: storyId });

    return res.json({
      status: 'OK',
      message: 'Story deleted successfully',
      storyId,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createStory,
  getStories,
  getUserStories,
  deleteStory,
};
