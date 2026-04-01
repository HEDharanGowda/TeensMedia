const User = require('../models/User');
const Post = require('../models/Post');
const { analyzeImageSafety } = require('../services/visionService');
const { uploadBase64Image } = require('../services/storageService');
const {
  MAX_VIOLATIONS,
  EXPLICIT_LEVEL,
  QUESTIONABLE_LEVEL,
} = require('../config/moderation');

async function checkContent(req, res, next) {
  try {
    const { imageBase64, caption = '' } = req.body;
    const authUserId = req.user?.userId;

    if (!authUserId || !imageBase64) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required fields',
      });
    }

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
        message: `Post blocked (${user.violations}/${MAX_VIOLATIONS} violations)`,
        violations: user.violations,
      });
    }

    if (isQuestionable) {
      return res.json({
        status: 'FLAGGED',
        message: 'Post flagged for review',
      });
    }

    const { imageUrl } = await uploadBase64Image(imageBase64, `posts/${user._id}`);

    await Post.create({
      userId: user._id,
      imageUrl,
      caption,
    });

    return res.json({
      status: 'APPROVED',
      message: 'Post successful!',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  checkContent,
};
