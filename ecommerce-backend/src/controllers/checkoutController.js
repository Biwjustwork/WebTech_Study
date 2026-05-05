const fs = require('fs');
const path = require('path');

// กำหนด Path ไปยังไฟล์ JSON ในโฟลเดอร์ data
const productsFilePath = path.join(__dirname, '../../data/products.json');
const ordersFilePath = path.join(__dirname, '../../data/orders.json');

// ฟังก์ชันช่วยอ่านไฟล์ JSON
const readJsonFile = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf8');
    return data ? JSON.parse(data) : [];
};

exports.processCheckout = (req, res) => {
    try {
        const { customer, cartItems } = req.body;

        // ขั้นตอนที่ 1: Server-Side Validation
        // ใช้ Regular Expressions เป็น Firewall ฝั่งเซิร์ฟเวอร์เพื่อตรวจสอบอีเมล
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!customer || !emailRegex.test(customer.email)) {
            return res.status(400).json({ error: "รูปแบบอีเมลไม่ถูกต้อง" });
        }

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: "ไม่มีสินค้าในตะกร้า" });
        }

        // โหลดข้อมูลสินค้าจริงจาก Database เพื่อความปลอดภัย
        const productsDB = readJsonFile(productsFilePath);
        let totalAmount = 0;

        // ขั้นตอนที่ 2: Inventory Check & Calculations[cite: 2]
        // ต้องคำนวณราคาใหม่และตรวจสอบสต็อกที่ฝั่ง Server เสมอ[cite: 2]
        for (let item of cartItems) {
            const product = productsDB.find(p => String(p.id) === String(item.id));
            
            if (!product) {
                throw new Error(`ไม่พบสินค้า ID: ${item.id}`);
            }
            
            // ตรวจสอบว่าสินค้ามีเพียงพอต่อการสั่งซื้อหรือไม่
            if (product.stock !== undefined && product.stock < item.quantity) {
                throw new Error(`สินค้า ${product.name} มีสต็อกไม่เพียงพอ`);
            }

            totalAmount += (product.price * item.quantity);
        }

        // ขั้นตอนที่ 3: Persistence[cite: 2]
        // บันทึกออเดอร์ลง "Orders" Database[cite: 2]
        const ordersDB = readJsonFile(ordersFilePath);
        const newOrder = {
            orderId: "ORD" + Date.now(),
            customer: customer,
            items: cartItems,
            totalAmount: totalAmount,
            createdAt: new Date().toISOString()
        };

        ordersDB.push(newOrder);
        // ทำการเขียนข้อมูลทับลงไปในไฟล์ orders.json
        fs.writeFileSync(ordersFilePath, JSON.stringify(ordersDB, null, 2));

        // คืนค่า Response เมื่อทำงานสำเร็จครบทุกขั้นตอน
        res.status(200).json({ message: "สั่งซื้อสำเร็จ", orderId: newOrder.orderId });

    } catch (error) {
        // หากขั้นตอนใดล้มเหลว ระบบจะมาที่จุดนี้ และไม่มีการบันทึกออเดอร์ (All-or-Nothing)[cite: 2]
        res.status(400).json({ error: error.message || "การสั่งซื้อล้มเหลว" });
    }
};