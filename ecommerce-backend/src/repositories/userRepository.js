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
    const result = await db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [userData.name, userData.email, userData.password]
    );
    return result.lastID;
};

module.exports = { findByEmail, create };