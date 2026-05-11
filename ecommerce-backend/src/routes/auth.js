const express = require('express');
const router = express.Router();
// Import Controller ที่เราเพิ่งสร้าง
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidationRules, loginValidationRules } = require('../middleware/validators');

// Apply authLimiter before your validation and controller
router.post('/register', authLimiter, registerValidationRules, authController.register);
router.post('/login', authLimiter, loginValidationRules, authController.login);

module.exports = router;