// checkoutService.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const getDbConnection = async () => {
    const db = await open({
        filename: path.join(__dirname, '../../store.db'),
        driver: sqlite3.Database
    });
    // แนะนำให้เปิด Foreign Keys เสมอทุกครั้งที่เชื่อมต่อ DB ใหม่
    await db.exec('PRAGMA foreign_keys = ON;'); 
    return db;
};

exports.createOrder = async (userId, cartItems) => {
    if (!userId) {
        throw new Error("ไม่สามารถสร้างออเดอร์ได้: ไม่พบข้อมูล userId");
    }
    const db = await getDbConnection();
    
    try {
        // เริ่มต้น Transaction (All-or-Nothing)
        await db.exec('BEGIN TRANSACTION;');
        
        let totalAmount = 0;
        const orderId = 'ORD-' + Date.now(); 

        // 1. วนลูปเช็คสต็อกและคำนวณราคาก่อน (ยังไม่ Insert/Update)
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
        }

        // 2. บันทึกคำสั่งซื้อรวมลงตาราง ORDERS (แม่) เป็นอันดับแรก
        await db.run(
            'INSERT INTO ORDERS (orderId, userId, totalAmount, createdAt) VALUES (?, ?, ?, ?)',
            [orderId, userId, totalAmount, new Date().toISOString()]
        );

        // 3. วนลูปตัดสต็อกและบันทึกลง ORDER_ITEMS (ลูก)
        for (const item of cartItems) {
            await db.run(
                'UPDATE PRODUCTS SET quantity_in_stock = quantity_in_stock - ? WHERE productId = ?',
                [item.quantity, item.productId]
            );

            await db.run(
                'INSERT INTO ORDER_ITEMS (orderId, productId, quantity) VALUES (?, ?, ?)',
                [orderId, item.productId, item.quantity]
            );
        }

        await db.exec('COMMIT;');
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