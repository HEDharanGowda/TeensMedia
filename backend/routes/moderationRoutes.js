const express = require('express');
const { checkContent } = require('../controllers/moderationController');

const router = express.Router();

router.post('/check', checkContent);

module.exports = router;
