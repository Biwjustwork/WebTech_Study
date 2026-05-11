// src/services/checkoutService.js
const { initDb } = require('../config/database');

exports.createOrder = async (userId, cartItems) => {
    if (!userId) {
        throw new Error("ไม่สามารถสร้างออเดอร์ได้: ไม่พบข้อมูล userId");
    }
    
    const db = await initDb(); // ดึง Connection กลางมาใช้
    
    try {
        await db.exec('BEGIN TRANSACTION;');
        
        let totalAmount = 0;
        const orderId = 'ORD-' + Date.now(); 

        for (const item of cartItems) {
            const product = await db.get('SELECT * FROM PRODUCTS WHERE productId = ?', [item.productId]);
            
            if (!product) throw new Error(`ไม่พบสินค้าที่มีรหัส ${item.productId}`);
            if (product.quantity_in_stock < item.quantity) throw new Error(`สินค้า ${product.name} มีสต็อกไม่เพียงพอ`);

            totalAmount += (product.price * item.quantity);
        }

        await db.run(
            'INSERT INTO ORDERS (orderId, userId, totalAmount, createdAt) VALUES (?, ?, ?, ?)',
            [orderId, userId, totalAmount, new Date().toISOString()]
        );

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
        await db.exec('ROLLBACK;');
        throw error; 
    } 
    // ❌ ลบ finally { await db.close(); } ด้านล่างสุดออก เพราะเราจะไม่ปิด Connection นี้
};