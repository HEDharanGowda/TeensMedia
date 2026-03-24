const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    violations: {
      type: Number,
      default: 0,
      min: 0,
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('User', userSchema);
