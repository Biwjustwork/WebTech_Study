const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// นำเข้า Route ของ Products
const productRoutes = require('./src/routes/products');

// Middleware สำหรับแยกแยะ JSON Request (เผื่อใช้งานในอนาคต)
app.use(express.json());

// สร้าง Endpoint หลัก: /api/products และผูกเข้ากับ Route ที่เราสร้างไว้
app.use('/api/products', productRoutes);

// เริ่มต้นเปิดเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`Server is running on port ${port}`,
        ' then test: http://localhost:3000/api/products?category=Fruits'
    );
});