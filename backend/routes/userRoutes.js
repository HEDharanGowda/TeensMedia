const express = require('express');
const { getUserStatus } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authenticateToken');

const router = express.Router();

router.get('/user/status', authenticateToken, getUserStatus);

module.exports = router;
