// register.js
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt'); // Leveraging the bcrypt dependency from your environment

// Resolve the path to the existing users.json data store[cite: 1]
const usersFilePath = path.join(__dirname, '../data/users.json');

/**
 * Controller to handle POST /api/register
 * Processes user registration, validates inputs, hashes passwords, and stores to JSON.
 */
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Input Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Name, email, and password are required fields.'
            });
        }

        // 2. Read the existing users from the JSON file
        let users = [];
        try {
            const fileData = await fs.readFile(usersFilePath, 'utf8');
            // Check if file is not empty to avoid JSON parse errors
            if (fileData.trim()) {
                users = JSON.parse(fileData);
            }
        } catch (readError) {
            // If the file doesn't exist yet (ENOENT), we proceed with an empty array
            if (readError.code !== 'ENOENT') {
                throw readError;
            }
        }

        // 3. Check for an existing username (using email as the identifier)
        const userExists = users.some(user => user.email === email);
        if (userExists) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'A user with this username/email already exists.'
            });
        }

        // 4. Securely hash the password
        // A salt round of 10 is the current industry standard balance between security and performance
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // 5. Construct and store the new user details
        const newUser = {
            email: email, // Email utilized as the username per requirements
            username: name,
            password_hash: password_hash,
            registration_date: new Date().toISOString()
        };

        users.push(newUser);

        // Write the updated array back to the JSON file
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');

        // 6. Send the Success Response
        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json({
            message: 'User successfully registered.',
            user: {
                username: newUser.username,
                email: newUser.email,
                name: newUser.name,
                registration_date: newUser.registration_date
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        // Fallback catch to prevent server crashes on unexpected errors
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'An error occurred while processing your registration.'
        });
    }
};

module.exports = { registerUser };