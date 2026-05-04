const express = require('express');
// Add this if you aren't already using it to parse JSON bodies
const bodyParser = require('body-parser'); 
require('dotenv').config(); // Ensure you are loading environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Import Routes
const productRoutes = require('./src/routes/products');
const authRoutes = require('./src/routes/auth'); // <-- Import the new auth route

// Mount Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes); // <-- Mount auth routes at /api/auth

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});