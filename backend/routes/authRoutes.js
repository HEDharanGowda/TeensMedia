const express = require('express');
const { login, register } = require('../controllers/authController');
const { validateBody } = require('../middlewares/validateRequest');
const { registerSchema, loginSchema } = require('../validations/authSchemas');

const router = express.Router();

router.post('/login', validateBody(loginSchema), login);
router.post('/register', validateBody(registerSchema), register);

module.exports = router;
