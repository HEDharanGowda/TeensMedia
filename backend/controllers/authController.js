const store = require('../db/inMemoryStore');

function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required',
    });
  }

  const user = store.authenticateUser(username, password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  if (user.banned) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been disabled for violating content guidelines',
    });
  }

  return res.json({
    success: true,
    userId: user.id,
    username: user.username,
  });
}

function register(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required',
    });
  }

  try {
    const user = store.createUser(username, password);

    return res.json({
      success: true,
      userId: user.id,
      username: user.username,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  login,
  register,
};
