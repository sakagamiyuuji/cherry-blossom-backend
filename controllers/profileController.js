// controllers/profileController.js
const User = require('../models/userModel');
const baseResponse = require('../utils/response');

const profileController = {
  async getProfile(req, res) {
    try {
      const userId = req.userId; // Extracted from the authMiddleware

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json(baseResponse(404, null, 'User tidak ditemukan'));
      }

      // Return the user's profile data, excluding sensitive information like password
      const {
        id,
        name,
        email,
        phone,
        city,
        bod,
        username,
        role_id,
        created_at,
        updated_at,
      } = user;
      res.status(200).json(
        baseResponse(
          200,
          {
            id,
            name,
            email,
            phone,
            city,
            bod,
            username,
            role_id,
            created_at,
            updated_at,
          },
          'Profile retrieved successfully',
        ),
      );
    } catch (error) {
      console.error('Get Profile Error:', error);
      res
        .status(500)
        .json(baseResponse(500, null, 'Terjadi kesalahan pada server'));
    }
  },
};

module.exports = profileController;
