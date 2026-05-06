const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// ฟังก์ชันเปิดการเชื่อมต่อฐานข้อมูล
const getDbConnection = async () => {
    return open({
        filename: path.join(__dirname, '../../store.db'),
        driver: sqlite3.Database
    });
};

// ==========================================
// Controller: สำหรับการลงทะเบียน (Register)
// ==========================================
exports.registerUser = async (req, res) => {
    let db;
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        db = await getDbConnection();

        // ตรวจสอบอีเมลซ้ำใน SQLite
        const existingUser = await db.get('SELECT email FROM USERS WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already taken' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const userId = crypto.randomUUID(); 
        const registration_date = new Date().toISOString();

        // บันทึกลง SQLite
        await db.run(
            `INSERT INTO USERS (userId, email, username, password_hash, registration_date) VALUES (?, ?, ?, ?, ?)`,
            [userId, email, name, password_hash, registration_date]
        );

        return res.status(201).json({ 
            message: 'User successfully registered.', 
            user: { id: userId, email, username: name, registration_date } 
        });

    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (db) await db.close();
    }
};

// ==========================================
// Controller: สำหรับเข้าสู่ระบบ (Login)
// ==========================================
exports.loginUser = async (req, res) => {
    let db;
    try {
        const email = req.body.email ? req.body.email.trim() : '';
        const password = req.body.password || '';

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        db = await getDbConnection();

        // อ่านข้อมูลจาก SQLite
        const user = await db.get('SELECT * FROM USERS WHERE email = ?', [email]);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { userId: user.userId, email: user.email, username: user.username },
            process.env.JWT_SECRET || 'super_secure_random_string',
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Authentication successful',
            token: token,
            user: { firstName: user.username, email: user.email }
        });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (db) await db.close();
    }
};