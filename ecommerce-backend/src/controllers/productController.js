const productService = require('../services/productService');

const getProducts = async (req, res) => {
    try {
        // รับ Parameter ชื่อ category จาก Query String (เช่น /api/products?category=fruits)
        const category = req.query.category;

        // เรียกใช้ Service เพื่อดึงข้อมูลสินค้า
        const products = await productService.getProductsByCategory(category);

        // ส่ง Response 200 OK สำเร็จ พร้อมคืนค่าข้อมูลเป็น JSON Array
        res.status(200).json(products);
    } catch (error) {
        // จัดการ Error Handling: หากเกิดข้อผิดพลาด ส่ง 500 Internal Server Error
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getProducts
};