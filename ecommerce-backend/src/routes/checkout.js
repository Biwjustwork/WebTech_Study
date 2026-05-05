const express = require('express');
const router = express.Router();

// Regex Patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CC_REGEX = /^\d{16}$/;

router.post('/api/checkout', async (req, res) => {
  const { cartItems, email, creditCard } = req.body;
  const errors = {};

  // 1. Validate incoming cart items
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    errors.cartItems = 'Your cart is empty or invalid.';
  }

  // 2. Validate email using regex
  if (!email || !EMAIL_REGEX.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  // 3. Validate 16-digit credit card number
  if (!creditCard || !CC_REGEX.test(creditCard)) {
    errors.creditCard = 'Credit card must be exactly 16 digits.';
  }

  // If validation fails, send a 400 status immediately.
  // Sending specific field errors lets the frontend display them 
  // while keeping the cart data intact.
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    // 4. Calculate the total
    // SECURITY NOTE: In a real app, never trust frontend prices! 
    // You should look up the price of each item's ID in your database to calculate the total.
    const orderTotal = cartItems.reduce((sum, item) => {
      return sum + (item.price * (item.quantity || 1));
    }, 0);

    // 5. The "Save Order" Step (Simulated)
    // const savedOrder = await OrderDatabase.create({ ... });
    
    // Simulating a failure during the save process
    // throw new Error("Database constraint violated");

    return res.status(200).json({
      success: true,
      message: 'Order processed successfully!',
      total: orderTotal
    });

  } catch (error) {
    // If the 'Save Order' step fails, catch it here.
    console.error('[Checkout Error]:', error);
    
    // We send a 400 (or 500) status with a specific error object.
    // The frontend should catch this 400 response, show the message, and NOT clear the cart.
    return res.status(400).json({
      success: false,
      errors: {
        server: 'There was a problem saving your order. Please try again.',
        details: error.message
      }
    });
  }
});

module.exports = router;