const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Get or create a conversation between two users
async function getOrCreateConversation(req, res, next) {
  try {
    const authUserId = req.user?.userId;
    const { userId: otherUserId } = req.params;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    if (authUserId === otherUserId) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Cannot create conversation with yourself',
      });
    }

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'User not found',
      });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [authUserId, otherUserId] },
    });

    // Create new conversation if doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [authUserId, otherUserId],
      });
    }

    return res.json({
      conversationId: conversation._id.toString(),
      participants: conversation.participants.map(p => p.toString()),
      otherUser: {
        userId: otherUser._id.toString(),
        username: otherUser.username,
      },
    });
  } catch (error) {
    return next(error);
  }
}

// Get all conversations for current user
async function getConversations(req, res, next) {
  try {
    const authUserId = req.user?.userId;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    const conversations = await Conversation.find({
      participants: authUserId,
    })
      .populate('participants', 'username _id')
      .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map((conv) => {
      const otherUser = conv.participants.find(
        (p) => p._id.toString() !== authUserId
      );

      return {
        conversationId: conv._id.toString(),
        otherUser: otherUser ? {
          userId: otherUser._id.toString(),
          username: otherUser.username,
        } : null,
        lastMessage: conv.lastMessage ? {
          text: conv.lastMessage.text,
          senderId: conv.lastMessage.senderId?.toString(),
          createdAt: conv.lastMessage.createdAt?.toISOString(),
        } : null,
        updatedAt: conv.updatedAt.toISOString(),
      };
    });

    return res.json(formattedConversations);
  } catch (error) {
    return next(error);
  }
}

// Get messages for a conversation
async function getMessages(req, res, next) {
  try {
    const authUserId = req.user?.userId;
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Conversation not found',
      });
    }

    if (!conversation.participants.includes(authUserId)) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Not authorized to view this conversation',
      });
    }

    // Build query
    const query = { conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('senderId', 'username _id');

    // Mark messages as seen
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: authUserId },
        seen: false,
      },
      { seen: true }
    );

    const formattedMessages = messages.map((msg) => ({
      messageId: msg._id.toString(),
      conversationId: msg.conversationId.toString(),
      senderId: msg.senderId._id.toString(),
      senderUsername: msg.senderId.username,
      text: msg.text,
      seen: msg.seen,
      createdAt: msg.createdAt.toISOString(),
    })).reverse(); // Reverse to get chronological order

    return res.json(formattedMessages);
  } catch (error) {
    return next(error);
  }
}

// Send a message (REST endpoint - also emits via Socket.IO)
async function sendMessage(req, res, next) {
  try {
    const authUserId = req.user?.userId;
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Message text is required',
      });
    }

    if (text.length > 2000) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Message too long (max 2000 characters)',
      });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Conversation not found',
      });
    }

    if (!conversation.participants.includes(authUserId)) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Not authorized to send to this conversation',
      });
    }

    // Get sender info
    const sender = await User.findById(authUserId);

    // Create message
    const message = await Message.create({
      conversationId,
      senderId: authUserId,
      text: text.trim(),
    });

    // Update conversation's last message
    conversation.lastMessage = {
      text: text.trim().substring(0, 100),
      senderId: authUserId,
      createdAt: message.createdAt,
    };
    await conversation.save();

    const formattedMessage = {
      messageId: message._id.toString(),
      conversationId: message.conversationId.toString(),
      senderId: authUserId,
      senderUsername: sender.username,
      text: message.text,
      seen: message.seen,
      createdAt: message.createdAt.toISOString(),
    };

    // Emit via Socket.IO (if available)
    const io = req.app.get('io');
    if (io) {
      // Emit to all participants in the conversation
      conversation.participants.forEach((participantId) => {
        io.to(`user_${participantId.toString()}`).emit('newMessage', formattedMessage);
      });
    }

    return res.status(201).json(formattedMessage);
  } catch (error) {
    return next(error);
  }
}

// Get unread message count
async function getUnreadCount(req, res, next) {
  try {
    const authUserId = req.user?.userId;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    // Get all conversations for user
    const conversations = await Conversation.find({
      participants: authUserId,
    });

    const conversationIds = conversations.map((c) => c._id);

    // Count unread messages
    const unreadCount = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      senderId: { $ne: authUserId },
      seen: false,
    });

    return res.json({ unreadCount });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
};
