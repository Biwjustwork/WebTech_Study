const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const checkoutController = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware'); // ดึง Middleware ที่คุณมีอยู่แล้วมาใช้

// สร้างกฎการตรวจสอบข้อมูลที่ส่งมาจากหน้าบ้าน
const validateCheckoutParams = [
    // ตรวจสอบว่าต้องมี cartItems และต้องเป็น Array ที่มีของอย่างน้อย 1 ชิ้น
    body('cartItems').isArray({ min: 1 }).withMessage('ตะกร้าสินค้าว่างเปล่า'),
    // ตรวจสอบแต่ละชิ้นในตะกร้าว่า รหัสสินค้าห้ามว่าง และจำนวนต้องเป็นตัวเลขจำนวนเต็มที่มากกว่า 0
    body('cartItems.*.productId').notEmpty().withMessage('รหัสสินค้าไม่ถูกต้อง'),
    body('cartItems.*.quantity').isInt({ min: 1 }).withMessage('จำนวนสินค้าต้องมากกว่า 0'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

// ใช้ protect ขวางไว้ก่อน เพื่อให้เช็ค Token อัตโนมัติ จากนั้นค่อย Validate ข้อมูล
router.post('/', protect, validateCheckoutParams, checkoutController.processCheckout);

module.exports = router;