const jwt = require('jsonwebtoken');
const checkoutService = require('../services/checkoutService'); // เรียกใช้งาน Service

exports.processCheckout = async (req, res) => {
    try {
        // 1. Authentication & Security Check
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
        }

        const token = authHeader.split(' ')[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'super_secure_random_string');
        } catch (err) {
            return res.status(401).json({ error: "Unauthorized: Token expired or invalid" });
        }

        const { customer, cartItems } = req.body;

        // 2. ตรวจสอบอีเมล (Logic เบื้องต้นจาก Request)
        if (customer.email !== decodedToken.email) {
            return res.status(403).json({ error: "Forbidden: อีเมลไม่ตรงกับบัญชีที่เข้าสู่ระบบ" });
        }

        // 3. โยนข้อมูลไปให้ Service ทำการคำนวณและบันทึกลง Database
        const orderId = await checkoutService.createOrder(decodedToken.userId, cartItems);

        // 4. ส่งผลลัพธ์กลับไปยัง Client
        res.status(200).json({ message: "สั่งซื้อสำเร็จ", orderId: orderId });

    } catch (error) {
        // หาก Service throw Error (เช่น สต็อกไม่พอ) จะถูกส่งมาเข้า catch นี้
        res.status(400).json({ error: error.message });
    }
};