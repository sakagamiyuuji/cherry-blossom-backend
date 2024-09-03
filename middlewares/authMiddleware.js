const jwt = require('jsonwebtoken');
const baseResponse = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if Authorization header is present
  if (!authHeader) {
    return res.status(401).json(baseResponse(401, null, 'No token provided'));
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[2];

  // Check if the token was extracted correctly
  if (!token) {
    return res.status(401).json(baseResponse(401, null, 'No token provided'));
  }

  try {
    // Verify the token and extract the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Attach the user ID to the request object
    next(); // Continue to the next middleware or route handler
  } catch (err) {
    // Handle different JWT verification errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(baseResponse(401, null, 'Token expired'));
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json(baseResponse(401, null, 'Invalid token'));
    } else {
      return res
        .status(500)
        .json(baseResponse(500, null, 'Failed to authenticate token'));
    }
  }
};

module.exports = authMiddleware;
