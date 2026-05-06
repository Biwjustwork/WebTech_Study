const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const jwt = require('jsonwebtoken');

// Helper function สำหรับเปิด Database
const getDbConnection = async () => {
    return open({
        filename: path.join(__dirname, '../../store.db'),
        driver: sqlite3.Database
    });
};

exports.processCheckout = async (req, res) => {
    let db;
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

        // 2. ตรวจสอบว่า Email ในฟอร์ม ตรงกับ Email ของ Account ที่ Login อยู่หรือไม่
        if (customer.email !== decodedToken.email) {
            return res.status(403).json({ error: "Forbidden: อีเมลไม่ตรงกับบัญชีที่เข้าสู่ระบบ" });
        }

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: "ไม่มีสินค้าในตะกร้า" });
        }

        db = await getDbConnection();

        // 3. เริ่ม Transaction (ถ้ามีอะไรพัง ข้อมูลจะไม่ถูกบันทึกเลย)
        await db.exec('BEGIN TRANSACTION;');

        let totalAmount = 0;
        const orderId = "ORD" + Date.now(); // สร้าง Order ID แบบง่ายๆ

        // 4. Inventory Check & Calculations
        for (let item of cartItems) {
            // ดึงข้อมูลสินค้าจาก DB
            const product = await db.get('SELECT * FROM PRODUCTS WHERE productId = ?', [item.productId]);
            
            if (!product) {
                throw new Error(`ไม่พบสินค้า ID: ${item.productId}`);
            }
            
            // ตรวจสอบสต็อก
            if (product.quantity_in_stock < item.quantity) {
                throw new Error(`สินค้า ${product.name} มีสต็อกไม่เพียงพอ`);
            }

            // คำนวณยอดรวมที่หลังบ้าน
            totalAmount += (product.price * item.quantity);

            // ตัดสต็อกสินค้าในตาราง PRODUCTS
            await db.run(
                'UPDATE PRODUCTS SET quantity_in_stock = quantity_in_stock - ? WHERE productId = ?',
                [item.quantity, item.productId]
            );

            // บันทึกลงตาราง ORDER_ITEMS
            await db.run(
                'INSERT INTO ORDER_ITEMS (orderId, productId, quantity) VALUES (?, ?, ?)',
                [orderId, item.productId, item.quantity]
            );
        }

        // 5. บันทึกคำสั่งซื้อลงตาราง ORDERS
        await db.run(
            'INSERT INTO ORDERS (orderId, userId, totalAmount, createdAt) VALUES (?, ?, ?, ?)',
            [orderId, decodedToken.userId, totalAmount, new Date().toISOString()]
        );

        // 6. Commit Transaction ยืนยันการบันทึกข้อมูล
        await db.exec('COMMIT;');
        res.status(200).json({ message: "สั่งซื้อสำเร็จ", orderId: orderId });

    } catch (error) {
        // หากล้มเหลว ทำการ Rollback ข้อมูลทั้งหมด (All-or-Nothing)
        if (db) await db.exec('ROLLBACK;');
        console.error("Checkout Error:", error);
        res.status(400).json({ error: error.message || "การสั่งซื้อล้มเหลว" });
    } finally {
        if (db) await db.close();
    }
};