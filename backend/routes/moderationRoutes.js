const express = require('express');
const { checkContent } = require('../controllers/moderationController');
const { authenticateToken } = require('../middlewares/authenticateToken');
const { validateBody } = require('../middlewares/validateRequest');
const { checkContentSchema } = require('../validations/moderationSchemas');

const router = express.Router();

router.post('/check', authenticateToken, validateBody(checkContentSchema), checkContent);

module.exports = router;
