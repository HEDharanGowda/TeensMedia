const express = require('express');
const { createStory, getStories, getUserStories } = require('../controllers/storyController');
const { authenticateToken } = require('../middlewares/authenticateToken');

const router = express.Router();

router.post('/stories', authenticateToken, createStory);
router.get('/stories', getStories);
router.get('/stories/:username', getUserStories);

module.exports = router;
