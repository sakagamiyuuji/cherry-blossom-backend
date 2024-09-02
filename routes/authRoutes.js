// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Login and Register Routes
router.post('/login', authController.login);
router.post('/register', authController.register);

// Route to check if email is already registered
router.get('/check-email', authController.checkEmail);

// Example of a protected route
router.get('/protected', authMiddleware, (req, res) => {
  res.json({
    data: { userId: req.userId },
    code: 200,
    message: 'Access granted to protected route',
  });
});

module.exports = router;
