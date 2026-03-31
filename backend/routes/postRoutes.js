const express = require('express');
const { getPosts, deletePost } = require('../controllers/postController');
const { authenticateToken } = require('../middlewares/authenticateToken');

const router = express.Router();

router.get('/posts', getPosts);
router.delete('/posts/:postId', authenticateToken, deletePost);

module.exports = router;
