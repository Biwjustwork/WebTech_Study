const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const registerUser = async (name, email, password) => {
    // 1. Business Logic: เช็คว่ามีผู้ใช้นี้หรือยัง
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) throw new Error('Email is already registered');

    // 2. Business Logic: Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. บันทึกลง DB ผ่าน Repository
    const newUserId = await userRepository.create({ 
        username: name, 
        email: email, 
        password_hash: hashedPassword 
    });
    return newUserId;
};

const loginUser = async (email, password) => {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new Error('Invalid email or password');
    
    // Use the generated secret and a reasonable expiration
    const token = jwt.sign(
        { id: user.userId }, // Minimized payload
        process.env.JWT_SECRET, 
        { 
            expiresIn: '2h', // Short lived for security
            audience: 'ecommerce-frontend', // Optional: verify who the token is for
            issuer: 'ecommerce-backend'     // Optional: verify who created the token
        }
    );
    return { token, user };
};

module.exports = { registerUser, loginUser };