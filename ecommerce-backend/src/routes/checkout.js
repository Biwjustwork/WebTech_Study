const express = require('express');
const router = express.Router();

// Regex patterns for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CC_REGEX = /^\d{16}$/;

router.post('/', async (req, res) => {
    try {
        const { cartItems, email, creditCard } = req.body;
        let validationErrors = {};

        // 1. Validate incoming cart items
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            validationErrors.cartItems = 'Cart is empty or invalid format.';
        }

        // 2. Validate email using Regex
        if (!email || !EMAIL_REGEX.test(email)) {
            validationErrors.email = 'Please provide a valid email address.';
        }

        // 3. Validate 16-digit credit card number
        if (!creditCard || !CC_REGEX.test(creditCard)) {
            validationErrors.creditCard = 'Credit card must be exactly 16 digits.';
        }

        // If validation fails, return 400 immediately with specific field errors
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed. Please check your inputs.',
                errors: validationErrors
            });
        }

        // 4. Calculate the total
        const total = cartItems.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const qty = parseInt(item.quantity, 10) || 1;
            return sum + (price * qty);
        }, 0);

        // --- 'Save Order' Step ---
        // Simulating a database/payment gateway call
        const orderSaved = await processOrderAndPayment({ cartItems, email, total, creditCard });

        if (!orderSaved) {
            // Trigger the catch block if the upstream service fails
            throw new Error('OrderSaveFailed');
        }

        // Success: Only now should the frontend clear the cart
        return res.status(200).json({
            success: true,
            message: 'Order placed successfully!',
            total
        });

    } catch (error) {
        console.error('Checkout Processing Error:', error);

        // A 400 status guarantees the frontend will not clear the cart
        return res.status(400).json({
            success: false,
            message: 'Failed to save the order.',
            errors: {
                server: 'We encountered an issue saving your order or processing your payment. Your cart has been saved. Please try again.'
            }
        });
    }
});

// Mock service function for demonstration
async function processOrderAndPayment(orderData) {
    // In a real scenario, integrate Stripe/Braintree here.
    // Returning false simulates a failure to fulfill the prompt's requirement.
    return false; 
}

module.exports = router;