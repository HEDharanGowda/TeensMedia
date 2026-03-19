const store = require('../db/inMemoryStore');
const { analyzeImageSafety } = require('../services/visionService');
const {
  MAX_VIOLATIONS,
  EXPLICIT_LEVEL,
  QUESTIONABLE_LEVEL,
} = require('../config/moderation');

function parseUserId(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

async function checkContent(req, res, next) {
  try {
    const { imageBase64, userId } = req.body;
    const numericUserId = parseUserId(userId);

    if (!numericUserId || !imageBase64) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Missing required fields',
      });
    }

    if (store.isUserBanned(numericUserId)) {
      return res.status(403).json({
        status: 'BANNED',
        message: `Account disabled: ${MAX_VIOLATIONS}/${MAX_VIOLATIONS} violations`,
      });
    }

    const { adult, racy } = await analyzeImageSafety(imageBase64);

    const isExplicit = adult === EXPLICIT_LEVEL || racy === EXPLICIT_LEVEL;
    const isQuestionable = adult === QUESTIONABLE_LEVEL || racy === QUESTIONABLE_LEVEL;

    if (isExplicit) {
      const violations = store.addViolation(numericUserId);

      if (violations >= MAX_VIOLATIONS) {
        store.banUser(numericUserId);
        return res.json({
          status: 'BANNED',
          message: `Account disabled (${MAX_VIOLATIONS}/${MAX_VIOLATIONS} violations)`,
          violations,
        });
      }

      return res.json({
        status: 'REJECTED',
        message: `Post blocked (${violations}/${MAX_VIOLATIONS} violations)`,
        violations,
      });
    }

    if (isQuestionable) {
      return res.json({
        status: 'FLAGGED',
        message: 'Post flagged for review',
      });
    }

    store.savePost({
      userId: numericUserId,
      imageBase64,
      timestamp: new Date().toISOString(),
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
