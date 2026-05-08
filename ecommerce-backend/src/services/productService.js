// ecommerce-backend/src/services/productService.js
const productRepository = require('../repositories/productRepository');

const getProductsByCategory = async (category) => {
    try {
        let products;

        // Business Logic: ตรวจสอบเงื่อนไขว่าส่ง category มาหรือไม่ เพื่อเลือกฟังก์ชันให้ถูก
        if (!category) {
            products = await productRepository.findAll();
        } else {
            products = await productRepository.findByCategory(category);
        }

        // สามารถเพิ่ม Business Logic อื่นๆ ตรงนี้ได้ เช่น กรองสินค้าที่หมดสต็อกออก, คำนวณส่วนลด

        return products;
    } catch (error) {
        // ส่ง Error กลับไปให้ Controller
        throw new Error(`ไม่สามารถดึงข้อมูลสินค้าได้: ${error.message}`);
    }
};

module.exports = {
    getProductsByCategory
};