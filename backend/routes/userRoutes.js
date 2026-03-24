const express = require('express');
const { getUserStatus, getUserProfile, getUserProfileByUsername, searchUsers, updateProfilePicture } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authenticateToken');
const { validateBody } = require('../middlewares/validateRequest');
const { updateProfilePictureSchema } = require('../validations/userSchemas');

const router = express.Router();

router.get('/user/status', authenticateToken, getUserStatus);
router.get('/user/profile', authenticateToken, getUserProfile);
router.get('/user/search', authenticateToken, searchUsers);
router.get('/user/:username/profile', authenticateToken, getUserProfileByUsername);
router.patch('/user/profile-picture', authenticateToken, validateBody(updateProfilePictureSchema), updateProfilePicture);

module.exports = router;
