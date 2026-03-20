const User = require('../models/User');

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

module.exports = {
  getUserStatus,
};
