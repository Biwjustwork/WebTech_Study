require('dotenv').config(); 
const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors'); // สำคัญมากสำหรับการเชื่อมต่อกับ Frontend แยก
const helmet = require('helmet'); // เพิ่มความปลอดภัยด้วยการตั้งค่า HTTP headers
const morgan = require('morgan'); // ใช้สำหรับ Logging Request/Response เพื่อช่วยในการ Debug และ Monitor
const { apiLimiter } = require('./src/middleware/rateLimiter');
const logger = require('./src/utils/logger');
const compression = require('compression');
const errorHandler = require('./src/middleware/errorHandler');

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
app.use(helmet()); // ใช้ Helmet เพื่อเพิ่มความปลอดภัยให้กับแอปของเรา
app.use(express.json());

// --- เพิ่ม Morgan สำหรับเก็บ Request Log ---
// พิมพ์บอกใน Terminal ทุกครั้งที่มีคนเรียก API ของเรา
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev')); 
} else {
    // ใน Production ให้เก็บบันทึกแบบละเอียดลงไฟล์
    app.use(morgan('combined', { 
        stream: { write: message => logger.info(message.trim()) }
    }));
}

const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:5500'];

const corsOptions = {
    origin: function (origin, callback) {
        // อนุญาตถ้า origin อยู่ใน List หรือไม่มี origin (เช่น การยิงผ่าน Postman/Server-to-Server)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS - โดเมนของคุณไม่ได้รับอนุญาตให้เข้าถึง API นี้'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // อนุญาตให้ส่ง Cookies/Authorization Headers เข้ามาได้
    optionsSuccessStatus: 200 
};

// Middleware
app.use(cors(corsOptions)); // อนุญาตให้ Frontend ยิง Request เข้ามาได้
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

// --- ใส่ Global Error Handler ไว้ "ล่างสุด" เสมอ ---
// ต้องอยู่หลัง Route ทั้งหมด เพื่อคอยดัก Error ที่หลุดออกมา
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`E-commerce API is up and running on port ${PORT}`);
    console.log(`CORS is restricted to allowed origins only.`);
    logger.info(`E-commerce API is up and running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});