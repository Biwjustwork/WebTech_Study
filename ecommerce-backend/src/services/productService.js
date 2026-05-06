// ecommerce-backend/src/services/productService.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// สร้างฟังก์ชันสำหรับเปิดการเชื่อมต่อฐานข้อมูล
// อ้างอิง Path ไปยังไฟล์ store.db ที่อยู่ในโฟลเดอร์ root ของโปรเจกต์
const getDbConnection = async () => {
    return open({
        filename: path.join(__dirname, '../../store.db'),
        driver: sqlite3.Database
    });
};

const getProductsByCategory = async (category) => {
    // เปิดการเชื่อมต่อ Database
    const db = await getDbConnection();

    try {
        let products;

        if (!category) {
            // กรณีไม่มี Parameter category: ใช้คำสั่ง SELECT เพื่อดึงข้อมูลสินค้าทั้งหมด
            products = await db.all('SELECT * FROM PRODUCTS');
        } else {
            // กรณีมี category: ใช้ Parameterized Query (?) เพื่อป้องกัน SQL Injection
            // ใช้ฟังก์ชัน LOWER() ของ SQL เพื่อให้ค้นหาแบบ Case-Insensitive (ไม่สนพิมพ์เล็ก/ใหญ่) เหมือนโค้ดเดิมของคุณ
            products = await db.all(
                'SELECT * FROM PRODUCTS WHERE LOWER(category) = LOWER(?)',
                [category]
            );
        }

        return products;
    } catch (error) {
        // หากมี Error จาก Database (เช่น Table ไม่มีอยู่จริง) ให้โยนกลับไปให้ Controller จัดการ
        throw error;
    } finally {
        // ปิดการเชื่อมต่อ Database ทุกครั้งเมื่อ Query เสร็จสิ้น เพื่อคืน Resource ให้ระบบ
        await db.close();
    }
};

module.exports = {
    getProductsByCategory
};