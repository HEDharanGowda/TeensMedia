const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Like a post
async function likePost(req, res, next) {
  try {
    const authUserId = req.user?.userId;
    const { postId } = req.params;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Post not found',
      });
    }

    // Check if already liked
    if (post.likes.includes(authUserId)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'You have already liked this post',
      });
    }

    post.likes.push(authUserId);
    await post.save();

    return res.json({
      status: 'SUCCESS',
      message: 'Post liked',
      likesCount: post.likes.length,
      isLiked: true,
    });
  } catch (error) {
    return next(error);
  }
}

// Unlike a post
async function unlikePost(req, res, next) {
  try {
    const authUserId = req.user?.userId;
    const { postId } = req.params;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Post not found',
      });
    }

    // Check if not liked
    if (!post.likes.includes(authUserId)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'You have not liked this post',
      });
    }

    post.likes = post.likes.filter((id) => id.toString() !== authUserId);
    await post.save();

    return res.json({
      status: 'SUCCESS',
      message: 'Post unliked',
      likesCount: post.likes.length,
      isLiked: false,
    });
  } catch (error) {
    return next(error);
  }
}

// Add a comment
async function addComment(req, res, next) {
  try {
    const authUserId = req.user?.userId;
    const { postId } = req.params;
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
        message: 'Comment text is required',
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Comment too long (max 500 characters)',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Post not found',
      });
    }

    const user = await User.findById(authUserId);

    const comment = await Comment.create({
      postId,
      userId: authUserId,
      text: text.trim(),
    });

    return res.status(201).json({
      commentId: comment._id.toString(),
      postId: comment.postId.toString(),
      userId: comment.userId.toString(),
      username: user.username,
      text: comment.text,
      createdAt: comment.createdAt.toISOString(),
    });
  } catch (error) {
    return next(error);
  }
}

// Get comments for a post
async function getComments(req, res, next) {
  try {
    const { postId } = req.params;
    const { limit = 20, before } = req.query;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Post not found',
      });
    }

    const query = { postId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('userId', 'username _id');

    const formattedComments = comments.map((comment) => ({
      commentId: comment._id.toString(),
      postId: comment.postId.toString(),
      userId: comment.userId._id.toString(),
      username: comment.userId.username,
      text: comment.text,
      createdAt: comment.createdAt.toISOString(),
    })).reverse();

    // Get total count
    const totalCount = await Comment.countDocuments({ postId });

    return res.json({
      comments: formattedComments,
      totalCount,
    });
  } catch (error) {
    return next(error);
  }
}

// Delete a comment
async function deleteComment(req, res, next) {
  try {
    const authUserId = req.user?.userId;
    const { commentId } = req.params;

    if (!authUserId) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized',
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Comment not found',
      });
    }

    // Only comment owner can delete
    if (comment.userId.toString() !== authUserId) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'Not authorized to delete this comment',
      });
    }

    await Comment.findByIdAndDelete(commentId);

    return res.json({
      status: 'SUCCESS',
      message: 'Comment deleted',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment,
};
