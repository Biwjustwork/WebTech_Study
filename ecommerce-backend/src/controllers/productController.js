const productService = require('../services/productService');

/**
 * @desc    Fetch all products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        
        // Standardized JSON response format
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error(`[Error] productController.getProducts: ${error.message}`);
        
        // Return a generic 500 error to the client to avoid leaking stack traces
        res.status(500).json({
            success: false,
            message: 'Server Error: Unable to fetch products at this time.'
        });
    }
};

module.exports = {
    getProducts
};