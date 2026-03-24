const express = require('express');
const {
	createStory,
	getStories,
	getUserStories,
	deleteStory,
} = require('../controllers/storyController');
const { authenticateToken } = require('../middlewares/authenticateToken');

const router = express.Router();

router.post('/stories', authenticateToken, createStory);
router.get('/stories', getStories);
router.get('/stories/:username', getUserStories);
router.delete('/stories/:storyId', authenticateToken, deleteStory);

module.exports = router;
