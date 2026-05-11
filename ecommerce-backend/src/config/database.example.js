// src/config/database.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// สร้างตัวแปรเก็บ Connection ไว้ (Singleton)
let dbInstance = null;

const initDb = async () => {
    // ถ้ามีการเชื่อมต่อแล้ว ให้คืนค่าตัวเดิมกลับไปเลย ไม่ต้องเปิดใหม่
    if (dbInstance) {
        return dbInstance;
    }

    // ดึง Path ของไฟล์ DB จาก .env หรือใช้ค่า Default
    const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/store.db');

    try {
        dbInstance = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        console.log('✅ Connected to SQLite database');

        // ตั้งค่าระดับ Production ที่นี่ที่เดียว!
        await dbInstance.exec('PRAGMA journal_mode = WAL;'); // แก้ปัญหาการล็อกไฟล์ อ่านเขียนพร้อมกันได้
        await dbInstance.exec('PRAGMA foreign_keys = ON;');  // บังคับใช้ความสัมพันธ์ของตาราง

        return dbInstance;
    } catch (error) {
        console.error('❌ Could not connect to database:', error);
        throw error;
    }
};

module.exports = { initDb };