const store = require('../db/inMemoryStore');

function parseUserId(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function getUserStatus(req, res) {
  const numericUserId = parseUserId(req.query.userId);

  if (!numericUserId) {
    return res.status(400).json({
      error: 'User ID required',
    });
  }

  return res.json({
    banned: store.isUserBanned(numericUserId),
  });
}

module.exports = {
  getUserStatus,
};
