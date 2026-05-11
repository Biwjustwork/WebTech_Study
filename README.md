# 🛒 Full-Stack E-Commerce Platform

A lightweight, responsive e-commerce web application featuring a vanilla JavaScript front-end and a RESTful Express/SQLite back-end. 

## 🏗 Architecture & Patterns

This project uses an **N-Tier (Layered) Architecture** on the backend to enforce a strict separation of concerns, making the codebase scalable and testable:
- **Routes:** Maps HTTP methods and endpoints to specific controllers.
- **Controllers:** Handles incoming HTTP requests, extracts parameters, and delegates to services.
- **Services:** Contains the core business logic (e.g., cart calculations, checkout validation).
- **Repositories:** Manages direct data access and SQLite queries, keeping SQL out of the business logic.

The front-end utilizes a modular approach, relying on dedicated service classes (`cartService.js`, `checkoutService.js`) to interact with the backend APIs via standard `fetch`.

## 💻 Tech Stack

* **Front-End:** HTML5, CSS3, Vanilla JavaScript, Bootstrap, OwlCarousel
* **Back-End:** Node.js, Express.js
* **Database:** SQLite3
* **Authentication:** JSON Web Tokens (JWT) / bcrypt (Optional/Adjust based on your setup)

## 🚀 Getting Started

### Prerequisites
* Node.js (v14 or higher)
* npm 

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd ecommerce-backend
   
2. Install dependencies:
   ```bash
   npm install

3. Set up environment variables:
   ```bash
   Create a .env file in the ecommerce-backend directory based on the .env.example:
   PORT=3000
   JWT_SECRET=your_jwt_secret

4. Initialize the database:
   ```bash
   node init-db.js

5. Start the server:
   ```bash
   npm start

### Frontend Setup
1. Open index.html in your browser, or use a local development server (like VS Code Live Server) to serve the static files from the root directory.

2. Ensure the base API URL in your js/ services points to http://localhost:3000.

## 🔗 Core API Endpoints
* POST /api/auth/login - Authenticates user and returns token.

* GET /api/products - Retrieves product catalog.

* POST /api/checkout - Processes cart checkout and creates an order.

## 🔮 Future Enhancements
* Integration with Stripe for live payment processing.

* Migrating from SQLite to PostgreSQL for horizontal scalability.

* Implementing Redux/React for front-end state management.

### Next Steps

How are you currently handling user authentication when they hit the checkout endpoint? If you aren't already, I'd suggest we look at utilizing `jsonwebtoken` (JWT) so users can maintain a secure session state while buying your items. Let me know if you want to dive into the `authController.js` or `authService.js` logic!