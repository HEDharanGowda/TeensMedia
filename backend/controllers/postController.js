const store = require('../db/inMemoryStore');

function getPosts(req, res) {
  return res.json(store.getPosts());
}

module.exports = {
  getPosts,
};
