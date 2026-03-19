const express = require('express');
const { getUserStatus } = require('../controllers/userController');

const router = express.Router();

router.get('/user/status', getUserStatus);

module.exports = router;
