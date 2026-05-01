const fs = require('fs').promises;
const path = require('path');

// Dynamically resolve the path to your existing JSON file
const dataPath = path.join(__dirname, '../../data/products.json');

/**
 * Reads and parses the local products JSON file.
 * @returns {Promise<Array>} Array of product objects
 */
const getAllProducts = async () => {
    try {
        const rawData = await fs.readFile(dataPath, 'utf-8');
        return JSON.parse(rawData);
    } catch (error) {
        // We throw the error up to the controller to handle the HTTP response
        throw new Error('Database read failed: ' + error.message);
    }
};

module.exports = {
    getAllProducts
};