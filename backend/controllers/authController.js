const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getSignedUrlForUrl } = require('../services/storageService');

function createAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },
  );
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been disabled for violating content guidelines',
      });
    }

    const accessToken = createAccessToken(user);

    return res.json({
      success: true,
      userId: user._id.toString(),
      username: user.username,
      profilePicture: await getSignedUrlForUrl(user.profilePicture),
      token: accessToken,
    });
  } catch (error) {
    return next(error);
  }
}

async function register(req, res, next) {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      passwordHash,
    });

    const accessToken = createAccessToken(user);

    return res.status(201).json({
      success: true,
      userId: user._id.toString(),
      username: user.username,
      profilePicture: await getSignedUrlForUrl(user.profilePicture),
      token: accessToken,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
  register,
};
