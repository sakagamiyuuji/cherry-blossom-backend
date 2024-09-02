// utils/jwt.js
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    bod: user.bod,
    iat: Math.floor(Date.now() / 1000), // Issued at
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '6h' });
};

module.exports = { generateToken };
