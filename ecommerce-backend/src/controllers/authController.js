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
        const token = await authService.loginUser(email, password);
        
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

module.exports = { register, login };