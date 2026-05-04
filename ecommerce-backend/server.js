const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors'); // สำคัญมากสำหรับการเชื่อมต่อกับ Frontend แยก
require('dotenv').config(); 

const app = express();
// อนุญาตให้ Express เสิร์ฟไฟล์ Static จากโฟลเดอร์ปัจจุบันหรือโฟลเดอร์ที่คุณเก็บไฟล์ Front-end ไว้
// เช่น ถ้าไฟล์ css/, js/, img/ อยู่ในโฟลเดอร์ public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // อนุญาตให้ Frontend ยิง Request เข้ามาได้
app.use(bodyParser.json());

// Import Routes
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products'); // ถ้ามี

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});