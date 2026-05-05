const express = require('express');
const router = express.Router();
// Import Controller ที่เราเพิ่งสร้าง
const authController = require('../controllers/authController');

// กำหนดเส้นทาง API
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

module.exports = router;