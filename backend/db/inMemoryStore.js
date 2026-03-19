const users = [];
const posts = [];
const violationCounts = new Map();

let nextUserId = 1;

function createUser(username, password) {
  if (users.some((user) => user.username === username)) {
    throw new Error('Username already exists');
  }

  const user = {
    id: nextUserId++,
    username,
    password,
    banned: false,
  };

  users.push(user);
  violationCounts.set(user.id, 0);
  return user;
}

function authenticateUser(username, password) {
  return users.find(
    (user) => user.username === username && user.password === password,
  );
}

function addViolation(userId) {
  const count = (violationCounts.get(userId) || 0) + 1;
  violationCounts.set(userId, count);
  return count;
}

function banUser(userId) {
  const user = users.find((item) => item.id === userId);
  if (user) {
    user.banned = true;
  }
}

function isUserBanned(userId) {
  const user = users.find((item) => item.id === userId);
  return user ? user.banned : false;
}

function savePost(post) {
  posts.unshift(post);
}

function getPosts() {
  return [...posts];
}

function getViolationCount(userId) {
  return violationCounts.get(userId) || 0;
}

module.exports = {
  createUser,
  authenticateUser,
  addViolation,
  banUser,
  isUserBanned,
  savePost,
  getPosts,
  getViolationCount,
};
