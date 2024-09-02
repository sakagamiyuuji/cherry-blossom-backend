// index.js
const express = require('express');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Authentication Routes
app.use('/api/auth', authRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to Cherry Blossom Backend API');
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    data: null,
    code: 404,
    message: 'Endpoint tidak ditemukan',
  });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
