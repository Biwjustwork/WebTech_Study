const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Helper เชื่อมต่อ DB
async function getDb() {
    return open({
        filename: path.join(__dirname, '../../store.db'),
        driver: sqlite3.Database
    });
}

// ค้นหาผู้ใช้ด้วย Email
const findByEmail = async (email) => {
    const db = await getDb();
    return await db.get('SELECT * FROM users WHERE email = ?', [email]);
};

// สร้างผู้ใช้ใหม่
const create = async (userData) => {
    const db = await getDb();
    const newUserId = crypto.randomUUID(); // สร้าง ID แบบ TEXT
    
    await db.run(
        'INSERT INTO USERS (userId, username, email, password_hash) VALUES (?, ?, ?, ?)',
        [newUserId, userData.username, userData.email, userData.password_hash] // แก้ key ให้ตรง
    );
    
    return newUserId; // คืนค่า newUserId แทน result.lastID
};

module.exports = { findByEmail, create };