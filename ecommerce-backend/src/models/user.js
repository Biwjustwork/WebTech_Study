const bcrypt = require('bcrypt');
// Assuming we are using an ORM/ODM like Prisma, Sequelize, or Mongoose
const User = require('./models/user'); 

async function authenticateUser(email, plainTextPassword) {
  try {
    // 1. Fetch the user from the database (NOT a JSON file)
    const user = await User.findOne({ where: { email: email } });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 2. Compare the plain text password with the hashed password in the DB
    const isMatch = await bcrypt.compare(plainTextPassword, user.passwordHash);
    
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // 3. Authentication successful! Return user data (excluding password)
    return {
      id: user.id,
      email: user.email,
      name: user.name
    };

  } catch (error) {
    console.error('Login error:', error.message);
    return null;
  }
}