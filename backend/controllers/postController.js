const Post = require('../models/Post');

async function getPosts(req, res, next) {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .select({ _id: 1, userId: 1, imageBase64: 1, caption: 1, createdAt: 1 });

    const normalizedPosts = posts.map((post) => ({
      id: post._id.toString(),
      userId: post.userId.toString(),
      imageBase64: post.imageBase64,
      caption: post.caption,
      timestamp: post.createdAt.toISOString(),
    }));

    return res.json(normalizedPosts);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getPosts,
};
