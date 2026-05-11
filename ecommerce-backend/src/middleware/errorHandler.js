const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // 1. บันทึก Error ลงไฟล์ Log (ให้ DevOps ดู)
    logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    // 2. กำหนด Status Code (ถ้าไม่ได้กำหนดมา ให้ถือว่าเป็น 500 Internal Server Error)
    const statusCode = err.status || 500;

    // 3. ส่ง Response กลับไปให้ Frontend
    res.status(statusCode).json({
        success: false,
        // ซ่อนรายละเอียด Error ใน Production เพื่อความปลอดภัย
        message: process.env.NODE_ENV === 'production' && statusCode === 500 
            ? 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง' 
            : err.message,
        // แบน Stack Trace ทิ้งถ้าอยู่บน Production
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;