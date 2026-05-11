const checkoutService = require('../services/checkoutService');

exports.processCheckout = async (req, res, next) => {
    try {
        const { customer, cartItems } = req.body;

        // ✅ 1. ตรวจสอบว่ามีข้อมูล customer ส่งมาหรือไม่ (ป้องกัน Server พัง)
        if (!customer || !customer.email) {
            return res.status(400).json({ error: "กรุณาระบุข้อมูลผู้ซื้อ" });
        }

        // ✅ 2. ตรวจสอบอีเมล: ใช้ข้อมูลจาก req.user.email (จาก Token ที่แฮกไม่ได้) 
        // มาเทียบกับอีเมลที่พิมพ์มาจากหน้าบ้าน
        if (customer.email !== req.user.email) {
            return res.status(403).json({ 
                success: false,
                error: "Forbidden: อีเมลไม่ตรงกับบัญชีที่เข้าสู่ระบบจริง" 
            });
        }

        // 3. ใช้ ID จาก Token เสมอในการสร้าง Order (ป้องกันการปลอม ID)
        const orderId = await checkoutService.createOrder(req.user.id, cartItems);

        res.status(200).json({ success: true, message: "สั่งซื้อสำเร็จ", orderId });

    } catch (error) {
        next(error);
    }
};