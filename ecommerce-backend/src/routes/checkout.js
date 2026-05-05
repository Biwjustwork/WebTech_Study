// ecommerce-backend/src/routes/checkout.js
const express = require('express');
const router = express.Router();

// นำเข้า Controller ที่จัดการ Logic ของ Checkout (เราจะสร้างไฟล์นี้ในขั้นตอนถัดไป)
const checkoutController = require('../controllers/checkoutController');

// กำหนด POST route สำหรับ Checkout
// Endpoint จริงจะเป็น POST /api/checkout (ขึ้นอยู่กับการกำหนดใน server.js)
router.post('/', checkoutController.processCheckout);

module.exports = router;