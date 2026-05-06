// ecommerce-backend/migrate.js
const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function migrateData() {
    const db = await open({
        filename: './store.db',
        driver: sqlite3.Database
    });

    console.log('Connected to SQLite. Starting data migration...');

    try {
        const usersData = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'users.json'), 'utf8'));
        const productsData = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf8'));
        const ordersData = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'orders.json'), 'utf8'));

        const emailToUserIdMap = {};
        for (const user of usersData) {
            emailToUserIdMap[user.email] = user.id;
        }

        await db.exec('BEGIN TRANSACTION;');

        // Migrate USERS
        console.log('Migrating USERS...');
        const insertUser = await db.prepare(`
            INSERT OR IGNORE INTO USERS (userId, email, username, password_hash, registration_date) 
            VALUES (?, ?, ?, ?, ?)
        `);
        for (const user of usersData) {
            await insertUser.run(user.id, user.email, user.username, user.password_hash, user.registration_date);
        }
        await insertUser.finalize();

        // Migrate PRODUCTS (เพิ่ม image_url และ description)
        console.log('Migrating PRODUCTS...');
        const insertProduct = await db.prepare(`
            INSERT OR IGNORE INTO PRODUCTS (productId, name, category, image_url, description, price, unit, quantity_in_stock) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const product of productsData) {
            await insertProduct.run(
                product.id, 
                product.name, 
                product.category, 
                product.image_url, 
                product.description, 
                product.price, 
                product.unit, 
                product.quantity
            );
        }
        await insertProduct.finalize();

        // Migrate ORDERS and ORDER_ITEMS
        console.log('Migrating ORDERS and ORDER_ITEMS...');
        const insertOrder = await db.prepare(`
            INSERT OR IGNORE INTO ORDERS (orderId, userId, totalAmount, createdAt) 
            VALUES (?, ?, ?, ?)
        `);
        const insertOrderItem = await db.prepare(`
            INSERT OR IGNORE INTO ORDER_ITEMS (orderId, productId, quantity) 
            VALUES (?, ?, ?)
        `);

        for (const order of ordersData) {
            const customerEmail = order.customer?.email;
            const matchedUserId = emailToUserIdMap[customerEmail];

            if (!matchedUserId) {
                console.warn(`[Warning] ข้ามคำสั่งซื้อ ${order.orderId} เนื่องจากไม่พบ Email: ${customerEmail} ในระบบ Users`);
                continue; 
            }

            await insertOrder.run(order.orderId, matchedUserId, order.totalAmount, order.createdAt);

            if (order.items && Array.isArray(order.items)) {
                for (const item of order.items) {
                    await insertOrderItem.run(order.orderId, item.id.toString(), item.quantity);
                }
            }
        }
        await insertOrder.finalize();
        await insertOrderItem.finalize();

        await db.exec('COMMIT;');
        console.log('Migration completed successfully! All data has been moved to SQLite.');

    } catch (error) {
        await db.exec('ROLLBACK;');
        console.error('Migration failed! Data integrity preserved via ROLLBACK. Error details:', error);
    } finally {
        await db.close();
    }
}

migrateData();