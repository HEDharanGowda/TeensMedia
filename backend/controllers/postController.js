const Post = require('../models/Post');
const Comment = require('../models/Comment');

async function getPosts(req, res, next) {
  try {
    const { userId } = req.query; // Optional: current user ID to check if liked

    const posts = await Post.find({})
      .populate('userId', 'username profilePicture')
      .sort({ createdAt: -1 })
      .select({ _id: 1, userId: 1, imageUrl: 1, imageBase64: 1, caption: 1, createdAt: 1, likes: 1 });

    // Get comment counts for all posts
    const postIds = posts.map((post) => post._id);
    const commentCounts = await Comment.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: '$postId', count: { $sum: 1 } } },
    ]);

    const commentCountMap = {};
    commentCounts.forEach((item) => {
      commentCountMap[item._id.toString()] = item.count;
    });

    const normalizedPosts = posts.map((post) => ({
      id: post._id.toString(),
      userId: post.userId._id.toString(),
      username: post.userId.username,
      profilePicture: post.userId.profilePicture || null,
      imageUrl: post.imageUrl,
      imageBase64: post.imageBase64, // legacy fallback
      caption: post.caption,
      timestamp: post.createdAt.toISOString(),
      likesCount: post.likes?.length || 0,
      commentsCount: commentCountMap[post._id.toString()] || 0,
      isLiked: userId ? post.likes?.some((id) => id.toString() === userId) : false,
    }));

    return res.json(normalizedPosts);
  } catch (error) {
    return next(error);
  }
}

async function deletePost(req, res, next) {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Post not found',
      });
    }

    // Only the post owner can delete
    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        status: 'ERROR',
        message: 'You can only delete your own posts',
      });
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ postId: post._id });

    // Delete the post
    await Post.findByIdAndDelete(postId);

    return res.json({
      status: 'SUCCESS',
      message: 'Post deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getPosts,
  deletePost,
};
