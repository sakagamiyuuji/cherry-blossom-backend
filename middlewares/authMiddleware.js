// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const baseResponse = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if Authorization header is present
  if (!authHeader) {
    return res.status(401).json(baseResponse(null, 401, 'No token provided'));
  }

  const token = authHeader.split(' ')[1]; // Expected format: "Bearer <token>"

  if (!token) {
    return res.status(401).json(baseResponse(null, 401, 'No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json(baseResponse(null, 401, 'Invalid token'));
  }
};

module.exports = authMiddleware;
