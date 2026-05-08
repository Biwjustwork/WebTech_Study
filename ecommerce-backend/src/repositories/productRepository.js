const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// Helper เชื่อมต่อ DB
const getDbConnection = async () => {
    return open({
        filename: path.join(__dirname, '../../store.db'),
        driver: sqlite3.Database
    });
};

// ดึงสินค้าทั้งหมด
const findAll = async () => {
    const db = await getDbConnection();
    try {
        return await db.all('SELECT * FROM PRODUCTS');
    } finally {
        await db.close();
    }
};

// ดึงสินค้าตามหมวดหมู่
const findByCategory = async (category) => {
    const db = await getDbConnection();
    try {
        return await db.all(
            'SELECT * FROM PRODUCTS WHERE LOWER(category) = LOWER(?)',
            [category]
        );
    } finally {
        await db.close();
    }
};

module.exports = {
    findAll,
    findByCategory
};