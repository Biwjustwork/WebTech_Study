// src/repositories/productRepository.js
const { initDb } = require('../config/database'); // นำเข้าจากไฟล์ศูนย์กลาง

// ดึงสินค้าทั้งหมด
const findAll = async () => {
    const db = await initDb(); // เรียกใช้ Connection ที่เปิดค้างไว้
    return await db.all('SELECT * FROM PRODUCTS');
    // ❌ ไม่ต้องมี try...finally เพื่อ close() แล้ว ปล่อยให้มันเปิดค้างไว้
};

// ดึงสินค้าตามหมวดหมู่
const findByCategory = async (category) => {
    const db = await initDb();
    return await db.all(
        'SELECT * FROM PRODUCTS WHERE LOWER(category) = LOWER(?)',
        [category]
    );
};

module.exports = { findAll, findByCategory };