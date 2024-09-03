const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const baseResponse = require('../utils/response');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Helper function to generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

const authController = {
  async login(req, res) {
    const { identifier, password } = req.body;

    // Cek apakah email/username dan password telah diisi
    if (!identifier) {
      return res
        .status(400)
        .json(baseResponse(400, null, 'Email/Username tidak boleh kosong'));
    }
    if (!password) {
      return res
        .status(400)
        .json(baseResponse(400, null, 'Password tidak boleh kosong'));
    }

    try {
      const user = await User.findByIdentifier(identifier);
      if (!user) {
        return res
          .status(400)
          .json(baseResponse(400, null, 'Email/Username atau password salah'));
      }

      const isPasswordValid =
        Buffer.from(password).toString('base64') === user.password;
      if (!isPasswordValid) {
        return res
          .status(400)
          .json(baseResponse(400, null, 'Email/Username atau password salah'));
      }

      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);
      user.token = token;
      user.refreshToken = refreshToken;

      await User.updateToken(user.id, token, refreshToken);

      res.status(200).json(baseResponse(200, { user }, 'Login berhasil'));
    } catch (error) {
      console.error('Login Error:', error);
      res
        .status(500)
        .json(baseResponse(500, null, 'Terjadi kesalahan pada server'));
    }
  },

  async register(req, res) {
    const { name, email, phone, city, bod, username, password, role_id } =
      req.body;

    // Validasi field wajib
    if (!name) {
      return res
        .status(400)
        .json(baseResponse(400, null, 'Nama tidak boleh kosong'));
    }
    if (!email) {
      return res
        .status(400)
        .json(baseResponse(400, null, 'Email tidak boleh kosong'));
    }
    if (!username) {
      return res
        .status(400)
        .json(baseResponse(400, null, 'Username tidak boleh kosong'));
    }
    if (!password) {
      return res
        .status(400)
        .json(baseResponse(400, null, 'Password tidak boleh kosong'));
    }

    try {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res
          .status(400)
          .json(baseResponse(400, null, 'Email telah terdaftar'));
      }

      // Create the new user
      const newUser = await User.createUser({
        name,
        email,
        phone: phone || null,
        city: city || null,
        bod: bod || null,
        username,
        password,
        role_id: role_id || null,
      });

      // Generate tokens after user is created
      const token = generateToken(newUser);
      const refreshToken = generateRefreshToken(newUser);

      // Update the user with the tokens
      await User.updateToken(newUser.id, token, refreshToken);

      // Add the tokens to the newUser object
      newUser.token = token;
      newUser.refresh_token = refreshToken;

      // Return the user data along with tokens
      res
        .status(201)
        .json(baseResponse(201, newUser, 'User berhasil didaftarkan'));
    } catch (error) {
      console.error('Registration Error:', error);
      res
        .status(500)
        .json(baseResponse(500, null, 'Terjadi kesalahan pada server'));
    }
  },
};

module.exports = authController;
