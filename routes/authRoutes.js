const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const refreshToken = require('../middlewares/refreshToken');

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/refresh-token', refreshToken);

router.get('/protected', authMiddleware, (req, res) => {
  res
    .status(200)
    .json(baseResponse(200, { userId: req.userId }, 'Access granted'));
});

module.exports = router;
