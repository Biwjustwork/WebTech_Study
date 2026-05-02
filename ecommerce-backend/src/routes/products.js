const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// กำหนด Method: GET สำหรับ Endpoint นี้ (อิงกับ /api/products จาก server.js)
// เมื่อมี Request เข้ามาจะถูกส่งไปให้ productController.getProducts ทำงาน
router.get('/', productController.getProducts);

module.exports = router;