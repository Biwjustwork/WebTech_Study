const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); //

// กำหนด Path ไปยังไฟล์ users.json[cite: 5]
const usersFilePath = path.join(__dirname, '../../data/users.json');

// ==========================================
// Controller: สำหรับการลงทะเบียน (Register)
// ==========================================
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        // อ่านข้อมูล users.json
        let users = [];
        try {
            const fileData = await fs.readFile(usersFilePath, 'utf8');
            if (fileData.trim()) users = JSON.parse(fileData);
        } catch (err) {
            if (err.code !== 'ENOENT') throw err;
        }

        // ตรวจสอบว่ามีอีเมลนี้ในระบบหรือยัง
        if (users.some(user => user.email === email)) {
            return res.status(409).json({ error: 'Username already taken' });
        }

        // แฮชรหัสผ่านด้วย bcrypt
        const password_hash = await bcrypt.hash(password, 10);

        // บันทึกผู้ใช้ใหม่
        const newUser = {
            email: email,
            username: name,
            password_hash: password_hash,
            registration_date: new Date().toISOString()
        };

        users.push(newUser);
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');

        return res.status(201).json({ message: 'User successfully registered.', user: newUser });
    } catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ==========================================
// Controller: สำหรับเข้าสู่ระบบ (Login)
// ==========================================
exports.loginUser = async (req, res) => {
    try {
        const email = req.body.email ? req.body.email.trim() : ''; //[cite: 5]
        const password = req.body.password || ''; //[cite: 5]

        if (!email || !password) { //[cite: 5]
            return res.status(400).json({ error: 'Email and password are required.' }); //[cite: 5]
        }

        const fileData = await fs.readFile(usersFilePath, 'utf8');
        const users = JSON.parse(fileData); //[cite: 5]
        const user = users.find(u => u.email === email); //[cite: 5]

        if (!user) { //[cite: 5]
            return res.status(401).json({ error: 'Invalid email or password.' }); //[cite: 5]
        }

        // 🔒 ตรวจสอบรหัสผ่านที่แฮชด้วย bcrypt (อัปเกรดจาก MD5 เดิม)
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' }); //[cite: 5]
        }

        // สร้าง JWT Token[cite: 5]
        const token = jwt.sign( //[cite: 5]
            { email: user.email, firstName: user.username }, //[cite: 5]
            process.env.JWT_SECRET || 'super_secure_random_string', //[cite: 5]
            { expiresIn: '1h' } //[cite: 5]
        );

        return res.status(200).json({ //[cite: 5]
            message: 'Authentication successful', //[cite: 5]
            token: token, //[cite: 5]
            user: { firstName: user.username, email: user.email } //[cite: 5]
        });

    } catch (error) { //[cite: 5]
        console.error('Login Error:', error); //[cite: 5]
        return res.status(500).json({ error: 'Internal server error' }); //[cite: 5]
    }
};