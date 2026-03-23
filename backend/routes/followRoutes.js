const express = require('express');
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
} = require('../controllers/followController');
const { authenticateToken } = require('../middlewares/authenticateToken');

const router = express.Router();

// Follow a user
router.post('/:userId/follow', authenticateToken, followUser);

// Unfollow a user
router.delete('/:userId/follow', authenticateToken, unfollowUser);

// Get followers of a user
router.get('/:userId/followers', getFollowers);

// Get following of a user
router.get('/:userId/following', getFollowing);

// Check if current user is following a specific user
router.get('/:userId/follow/status', authenticateToken, checkFollowStatus);

module.exports = router;
