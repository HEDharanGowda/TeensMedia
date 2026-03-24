const express = require('express');
const {
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment,
} = require('../controllers/interactionController');
const { authenticateToken } = require('../middlewares/authenticateToken');

const router = express.Router();

// Like/Unlike routes
router.post('/:postId/like', authenticateToken, likePost);
router.delete('/:postId/like', authenticateToken, unlikePost);

// Comment routes
router.post('/:postId/comments', authenticateToken, addComment);
router.get('/:postId/comments', getComments);
router.delete('/comments/:commentId', authenticateToken, deleteComment);

module.exports = router;
