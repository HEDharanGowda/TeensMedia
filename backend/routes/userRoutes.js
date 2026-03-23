const express = require('express');
const { getUserStatus, getUserProfile, getUserProfileByUsername, searchUsers } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authenticateToken');

const router = express.Router();

router.get('/user/status', authenticateToken, getUserStatus);
router.get('/user/profile', authenticateToken, getUserProfile);
router.get('/user/search', authenticateToken, searchUsers);
router.get('/user/:username/profile', authenticateToken, getUserProfileByUsername);

module.exports = router;
