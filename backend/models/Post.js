const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    // Legacy fallback until all posts are migrated to URLs
    imageBase64: {
      type: String,
    },
    caption: {
      type: String,
      default: '',
      maxlength: 500,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  },
);

// Index for faster like lookups
postSchema.index({ likes: 1 });

module.exports = mongoose.model('Post', postSchema);
