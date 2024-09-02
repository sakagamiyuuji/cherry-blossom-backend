// controllers/authController.js
const User = require('../models/userModel');
const { generateToken } = require('../utils/jwt');
const baseResponse = require('../utils/response');
const bcrypt = require('bcryptjs');

const authController = {
  /**
   * Handle user login.
   * Allows login with either email or username along with password.
   */
  async login(req, res) {
    const { identifier, password } = req.body; // 'identifier' can be email or username

    // Check if identifier and password are provided
    if (!identifier || !password) {
      return res
        .status(400)
        .json(baseResponse(null, 400, 'Email/password belum dimasukan'));
    }

    try {
      // Find user by email or username
      const user = await User.findByIdentifier(identifier);
      //console.log(user);
      if (!user) {
        return res
          .status(400)
          .json(baseResponse(null, 400, 'Email/password salah'));
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res
          .status(400)
          .json(baseResponse(null, 400, 'Email/password salah'));
      }

      // Generate JWT token
      const token = generateToken(user);
      User.updateToken(user.id, token);

      user.token = token;

      res.status(200).json(baseResponse(user, 200, 'Login berhasil'));
    } catch (error) {
      console.error('Login Error:', error);
      res
        .status(500)
        .json(baseResponse(null, 500, 'Terjadi kesalahan pada server'));
    }
  },

  /**
   * Handle user registration.
   * Checks if email is already registered before creating a new user.
   */
  async register(req, res) {
    const { email, username, password } = req.body;

    // Check if all fields are provided
    if (!email || !username || !password) {
      return res
        .status(400)
        .json(baseResponse(null, 400, 'Semua field harus diisi'));
    }

    try {
      // Check if email is already registered
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res
          .status(400)
          .json(baseResponse(null, 400, 'Email telah terdaftar'));
      }

      // Create new user
      const newUser = await User.createUser(email, username, password);
      const token = generateToken(newUser);

      res
        .status(201)
        .json(baseResponse({ token }, 201, 'User berhasil didaftarkan'));
    } catch (error) {
      console.error('Registration Error:', error);
      res
        .status(500)
        .json(baseResponse(null, 500, 'Terjadi kesalahan pada server'));
    }
  },

  /**
   * Check if an email is already registered.
   */
  async checkEmail(req, res) {
    const { email } = req.query;

    if (!email) {
      return res
        .status(400)
        .json(baseResponse(null, 400, 'Email belum dimasukan'));
    }

    try {
      const user = await User.findByEmail(email);
      if (user) {
        return res
          .status(200)
          .json(
            baseResponse({ isRegistered: true }, 200, 'Email telah terdaftar'),
          );
      } else {
        return res
          .status(200)
          .json(
            baseResponse({ isRegistered: false }, 200, 'Email belum terdaftar'),
          );
      }
    } catch (error) {
      console.error('Check Email Error:', error);
      res
        .status(500)
        .json(baseResponse(null, 500, 'Terjadi kesalahan pada server'));
    }
  },
};

module.exports = authController;
