const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageBase64: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to automatically delete expired stories
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
