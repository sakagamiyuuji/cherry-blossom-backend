const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/userModel');
const baseResponse = require('../utils/response');
const { generateToken, generateRefreshToken } = require('../utils/jwt');

const authController = {
  async login(req, res) {
    const { identifier, password } = req.body;

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

      const token = generateToken(newUser);
      const refreshToken = generateRefreshToken(newUser);

      await User.updateToken(newUser.id, token, refreshToken);

      newUser.token = token;
      newUser.refresh_token = refreshToken;

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

  async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json(baseResponse(400, null, 'Email tidak boleh kosong'));
    }

    try {
      const user = await User.findByEmail(email);

      if (!user) {
        return res
          .status(404)
          .json(baseResponse(404, null, 'User tidak ditemukan'));
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      // Set expiry time to 1 hour from now
      const resetTokenExpiry = new Date(Date.now() + 3600000);

      await User.updateResetToken(user.id, resetToken, resetTokenExpiry);

      const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        host: 'smtp.gmail.com',
        port: '587',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        to: user.email,
        from: `CherryBlossom 👻 <gcyber21@gmai.com>`,
        subject: 'Password Reset',
        text:
          `Anda menerima email ini karena Anda (atau orang lain) telah meminta reset password akun Anda.\n\n` +
          `Silakan klik link berikut, atau tempel di browser untuk menyelesaikan prosesnya:\n\n` +
          `${resetLink}\n\n` +
          `Jika Anda tidak meminta reset password, silakan abaikan email ini dan password Anda akan tetap sama.\n`,
      };

      await transporter.sendMail(mailOptions);

      res
        .status(200)
        .json(baseResponse(200, null, 'Email reset password telah dikirim'));
    } catch (error) {
      console.error('Forgot Password Error:', error);
      res.status(500).json(baseResponse(500, null, error));
    }
  },

  async resetPassword(req, res) {
    const { token } = req.body;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res
        .status(400)
        .json(baseResponse(400, null, 'Password tidak boleh kosong'));
    }

    try {
      const user = await User.findByResetToken(token);

      if (!user) {
        return res
          .status(400)
          .json(
            baseResponse(400, null, 'Token tidak valid atau telah kedaluwarsa'),
          );
      }

      const hashedPassword = Buffer.from(newPassword).toString('base64');
      await User.updatePassword(user.id, hashedPassword);

      res
        .status(200)
        .json(baseResponse(200, null, 'Password berhasil direset'));
    } catch (error) {
      console.error('Reset Password Error:', error);
      res
        .status(500)
        .json(baseResponse(500, null, 'Terjadi kesalahan pada server'));
    }
  },
};

module.exports = authController;
