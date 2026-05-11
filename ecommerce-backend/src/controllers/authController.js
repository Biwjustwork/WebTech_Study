const authService = require('../services/authService');

const register = async (req, res, next) => { // Added 'next' for global error handling
    try {
        // Because of our middleware, we know these exist and are valid format
        const { name, email, password } = req.body; 
        
        const userId = await authService.registerUser(name, email, password);
        
        return res.status(201).json({ 
            success: true,
            message: 'User registered successfully', 
            userId 
        });
    } catch (error) {
        // Instead of res.status(400), pass it to our global handler (Point 8 in checklist)
        next(error); 
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // ✅ รับค่า user ออกมาจาก authService ด้วย
        const { token, user } = await authService.loginUser(email, password);
        
        return res.status(200).json({ 
            success: true,
            message: 'Login successful', 
            token,
            user: {
                id: user.userId,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        // This will catch "Invalid email or password" from your service
        next(error); 
    }
};

module.exports = { register, login };