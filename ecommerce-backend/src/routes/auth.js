const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// กำหนด Path ไปยังไฟล์ users.json (อ้างอิงจากโฟลเดอร์ปัจจุบัน src/routes/)
const usersFilePath = path.join(__dirname, '../../data/users.json');

router.post('/login', (req, res) => {
    try {
        // แนะนำให้ใส่ .trim() เพื่อตัดช่องว่างหน้า/หลังที่อาจจะเผลอพิมพ์ติดมา
        const email = req.body.email ? req.body.email.trim() : '';
        const password = req.body.password || '';

        console.log("-----------------------------------------");
        console.log(`[DEBUG] 1. Login attempt for Email: "${email}"`);
        console.log(`[DEBUG] 2. Raw Password received: "${password}"`);

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const usersData = fs.readFileSync(usersFilePath, 'utf8');
        const users = JSON.parse(usersData);

        const user = users.find(u => u.email === email);

        if (!user) {
            console.log("[DEBUG] 3. ❌ User not found in users.json!");
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        
        console.log(`[DEBUG] 3. ✅ User found: ${user.username}`);

        const submittedPasswordHash = crypto.createHash('md5').update(password).digest('hex');
        
        console.log(`[DEBUG] 4. Expected Hash (In JSON):  ${user.password_hash}`);
        console.log(`[DEBUG] 5. Actual Hash (Calculated): ${submittedPasswordHash}`);

        if (submittedPasswordHash !== user.password_hash) {
            console.log("[DEBUG] 6. ❌ Password Hash MISMATCH!");
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        console.log("[DEBUG] 6. ✅ Password Match! Generating Token...");

        // ... (โค้ดส่วนออก JWT token เหมือนเดิม) ...
        const token = jwt.sign(
            { email: user.email, firstName: user.username },
            process.env.JWT_SECRET || 'super_secure_random_string',
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Authentication successful',
            token: token,
            user: {
                firstName: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;