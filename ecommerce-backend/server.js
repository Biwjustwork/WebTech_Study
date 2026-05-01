const express = require('express');
const cors = require('cors'); // Import CORS
const productRoutes = require('./src/routes/products');

const app = express();

// อนุญาตให้ทุก Origin เข้าถึง API ได้ (สำหรับการพัฒนา)
app.use(cors()); 
app.use(express.json());

app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});