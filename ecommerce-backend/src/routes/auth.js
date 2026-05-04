const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// TODO: Import your actual User model here
const User = require('../models/user'); 

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // 1. Find the user (Replace with your actual DB query logic)
        // const user = await User.findOne({ email });
        
        // --- TEMPORARY MOCK USER FOR TESTING ---
        // We are mocking the DB response based on the MD5 hash setup we discussed earlier.
        // Replace this block with the real DB query once your database is connected.
        const user = {
            _id: 'user_12345',
            email: 'alice.w@example.com',
            passwordHash: '$2b$10$YourBcryptHashedPasswordHere' // This should be a bcrypt hash in production!
        };

        if (!user || user.email !== email) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // 2. Compare passwords
        // Note: For testing your existing MD5 mock data, bcrypt.compare will fail. 
        // You will need to hash passwords with bcrypt during the registration phase.
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // 3. Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 4. Send response
        res.status(200).json({
            message: 'Authentication successful',
            token: token
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;