// src/repositories/userRepository.js
const { initDb } = require('../config/database');
const crypto = require('crypto'); // อย่าลืม import crypto ด้วย

const findByEmail = async (email) => {
    const db = await initDb();
    return await db.get('SELECT * FROM users WHERE email = ?', [email]);
};

const create = async (userData) => {
    const db = await initDb();
    const newUserId = crypto.randomUUID(); 
    
    await db.run(
        'INSERT INTO USERS (userId, username, email, password_hash) VALUES (?, ?, ?, ?)',
        [newUserId, userData.username, userData.email, userData.password_hash] 
    );
    
    return newUserId; 
};

module.exports = { findByEmail, create };