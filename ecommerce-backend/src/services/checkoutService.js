const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// Helper function สำหรับเปิด Database (ในอนาคตสามารถแยกไปไว้ในโฟลเดอร์ repositories ได้)
const getDbConnection = async () => {
    return open({
        filename: path.join(__dirname, '../../store.db'),
        driver: sqlite3.Database
    });
};

exports.createOrder = async (userId, cartItems) => {
    const db = await getDbConnection();
    
    try {
        // เริ่มต้น Transaction (All-or-Nothing)
        await db.exec('BEGIN TRANSACTION;');
        
        let totalAmount = 0;
        const orderId = 'ORD-' + Date.now(); // สร้าง orderId (สามารถปรับเป็น UUID หรือ Format ที่ต้องการได้)

        // 1. วนลูปเช็คสต็อกและคำนวณราคาสินค้ารวม
        for (const item of cartItems) {
            const product = await db.get('SELECT * FROM PRODUCTS WHERE productId = ?', [item.productId]);
            
            if (!product) {
                throw new Error(`ไม่พบสินค้าที่มีรหัส ${item.productId}`);
            }

            if (product.quantity_in_stock < item.quantity) {
                throw new Error(`สินค้า ${product.name} มีสต็อกไม่เพียงพอ`);
            }

            // คำนวณยอดรวมที่หลังบ้านเพื่อป้องกันการแก้ราคาส่งมาจากหน้าบ้าน
            totalAmount += (product.price * item.quantity);

            // 2. ตัดสต็อกสินค้าในตาราง PRODUCTS
            await db.run(
                'UPDATE PRODUCTS SET quantity_in_stock = quantity_in_stock - ? WHERE productId = ?',
                [item.quantity, item.productId]
            );

            // 3. บันทึกลงตาราง ORDER_ITEMS
            await db.run(
                'INSERT INTO ORDER_ITEMS (orderId, productId, quantity) VALUES (?, ?, ?)',
                [orderId, item.productId, item.quantity]
            );
        }

        // 4. บันทึกคำสั่งซื้อรวมลงตาราง ORDERS
        await db.run(
            'INSERT INTO ORDERS (orderId, userId, totalAmount, createdAt) VALUES (?, ?, ?, ?)',
            [orderId, userId, totalAmount, new Date().toISOString()]
        );

        // 5. ยืนยันการบันทึกข้อมูล
        await db.exec('COMMIT;');
        
        // คืนค่า orderId กลับไปยัง Controller
        return orderId;

    } catch (error) {
        // หากเกิด Error กลางทาง ให้ยกเลิกการเปลี่ยนแปลงทั้งหมด
        await db.exec('ROLLBACK;');
        throw error; 
    } finally {
        // ปิดการเชื่อมต่อฐานข้อมูล
        await db.close(); 
    }
};