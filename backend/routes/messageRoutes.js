const express = require('express');
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
} = require('../controllers/messageController');
const { authenticateToken } = require('../middlewares/authenticateToken');

const router = express.Router();

// Get all conversations for current user
router.get('/conversations', authenticateToken, getConversations);

// Get unread message count
router.get('/unread', authenticateToken, getUnreadCount);

// Get or create conversation with another user
router.post('/conversations/user/:userId', authenticateToken, getOrCreateConversation);

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authenticateToken, getMessages);

// Send a message to a conversation
router.post('/conversations/:conversationId/messages', authenticateToken, sendMessage);

module.exports = router;
