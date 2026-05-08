const authService = require('../services/authService');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body; // รับค่าจาก Request
        const userId = await authService.registerUser(name, email, password); // โยนให้ Service จัดการ
        
        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // ✅ รับค่า user ออกมาจาก authService ด้วย
        const { token, user } = await authService.loginUser(email, password);
        
        // ✅ แนบ user ส่งคืนไปให้หน้าเว็บ
        res.status(200).json({ 
            message: 'Login successful', 
            token: token,
            user: {
                id: user.userId,
                username: user.username, // 👈 แปลงจากคอลัมน์ username ใน DB ให้เป็น username ที่หน้าเว็บตามหา
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { register, login };