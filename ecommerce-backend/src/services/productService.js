const fs = require('fs').promises;
const path = require('path');

// อ้างอิง Path ไปยังไฟล์ products.json อิงจากตำแหน่งของไฟล์นี้
const dataPath = path.join(__dirname, '../../data/products.json');

const getProductsByCategory = async (category) => {
    try {
        // อ่านข้อมูลจากไฟล์ JSON
        const rawData = await fs.readFile(dataPath, 'utf8');
        const products = JSON.parse(rawData);

        // ถ้าไม่มี Parameter category ส่งมา จะทำการคืนค่าสินค้าทั้งหมด
        if (!category) {
            return products;
        }

        // ค้นหาข้อมูลใน JSON โดยกรองเฉพาะหมวดหมู่ที่ตรงกับ Parameter
        // (เปรียบเทียบด้วย toLowerCase เพื่อให้รองรับตัวพิมพ์เล็ก-ใหญ่ได้อย่างยืดหยุ่น)
        const filteredProducts = products.filter(
            (product) => product.category && product.category.toLowerCase() === category.toLowerCase()
        );

        return filteredProducts;
    } catch (error) {
        // หากมีข้อผิดพลาด (เช่น หาไฟล์ไม่เจอ หรือ JSON ผิดรูปแบบ) ให้โยน Error ไปที่ Controller
        throw error;
    }
};

module.exports = {
    getProductsByCategory
};