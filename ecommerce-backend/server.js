require('dotenv').config(); 
const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors'); // สำคัญมากสำหรับการเชื่อมต่อกับ Frontend แยก
const helmet = require('helmet'); // เพิ่มความปลอดภัยด้วยการตั้งค่า HTTP headers
const { apiLimiter } = require('./src/middleware/rateLimiter');
const compression = require('compression');

const app = express();
// อนุญาตให้ Express เสิร์ฟไฟล์ Static จากโฟลเดอร์ปัจจุบันหรือโฟลเดอร์ที่คุณเก็บไฟล์ Front-end ไว้
// เช่น ถ้าไฟล์ css/, js/, img/ อยู่ในโฟลเดอร์ public
//app.use(express.static(path.join(__dirname, 'public')));
app.use(compression({
    level: 6, // Sets the compression level (0-9). 6 is the industry standard balance of speed/CPU.
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false; // Don't compress if this header is present
        }
        return compression.filter(req, res);
    }
})); // ใช้ Compression เพื่อเพิ่มประสิทธิภาพในการส่งข้อมูลไปยัง Client 
app.use(express.json());
app.use(helmet()); // ใช้ Helmet เพื่อเพิ่มความปลอดภัยให้กับแอปของเรา
const PORT = process.env.PORT || 3000;

// Senior Dev Tip: Create a whitelist or use the Env variable
/*const corsOptions = {
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5500', // Default to local if env is missing
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // Required if you decide to use Cookies/Sessions later
    optionsSuccessStatus: 200 
};
*/
// Middleware
app.use(cors()); // อนุญาตให้ Frontend ยิง Request เข้ามาได้
app.use(bodyParser.json());
app.disable('x-powered-by'); // ซ่อนข้อมูลเวอร์ชันของ Express เพื่อความปลอดภัย
app.use('/api/', apiLimiter);



// Import Routes
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products'); // ถ้ามี
const checkoutRoutes = require('./src/routes/checkout');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`E-commerce API is up and running on port ${PORT}`);
});