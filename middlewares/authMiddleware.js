const jwt = require('jsonwebtoken');
const baseResponse = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json(baseResponse(401, null, 'No token provided'));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(baseResponse(401, null, 'No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(baseResponse(401, null, 'Token expired'));
    } else {
      return res.status(401).json(baseResponse(401, null, 'Invalid token'));
    }
  }
};

module.exports = authMiddleware;
