// ecommerce-backend/init-db.js
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let dbInstance = null;

async function setupDatabase() {
    // Return existing connection if already initialized (Singleton Pattern)
    if (dbInstance) return dbInstance;

    try {
        const db = await open({
            filename: './store.db',
            driver: sqlite3.Database
        });

        console.log('Connected to the SQLite database.');
        await db.exec('PRAGMA foreign_keys = ON;');
        await db.exec('PRAGMA journal_mode = WAL;');
        await db.exec('PRAGMA synchronous = NORMAL;');

        // 1. ตาราง USERS
        await db.exec(`
            CREATE TABLE IF NOT EXISTS USERS (
                userId TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                username TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                registration_date DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Table USERS created successfully.');

        // 2. ตาราง PRODUCTS (เพิ่ม image_url และ description)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS PRODUCTS (
                productId TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                image_url TEXT,
                description TEXT,
                price REAL NOT NULL,
                unit TEXT,
                quantity_in_stock INTEGER NOT NULL DEFAULT 0
            );
        `);
        console.log('Table PRODUCTS created successfully.');

        // 3. ตาราง ORDERS
        await db.exec(`
            CREATE TABLE IF NOT EXISTS ORDERS (
                orderId TEXT PRIMARY KEY,
                userId TEXT NOT NULL,
                totalAmount REAL NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES USERS(userId) ON DELETE CASCADE
            );
        `);
        console.log('Table ORDERS created successfully.');

        // 4. ตาราง ORDER_ITEMS
        await db.exec(`
            CREATE TABLE IF NOT EXISTS ORDER_ITEMS (
                orderId TEXT NOT NULL,
                productId TEXT NOT NULL,
                quantity INTEGER NOT NULL CHECK(quantity > 0),
                PRIMARY KEY (orderId, productId),
                FOREIGN KEY (orderId) REFERENCES ORDERS(orderId) ON DELETE CASCADE,
                FOREIGN KEY (productId) REFERENCES PRODUCTS(productId) ON DELETE RESTRICT
            );
        `);
        console.log('Table ORDER_ITEMS created successfully.');

        console.log('Database initialization completed.');
        dbInstance = db;
        return dbInstance;

    } catch (err) {
        console.error('Error during database setup:', err.message);
        throw err; // In production, crash the app if DB fails to load
    }
}

setupDatabase();