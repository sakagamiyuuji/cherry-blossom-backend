const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const baseResponse = require('../utils/response');

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(401)
      .json(baseResponse(401, null, 'No refresh token provided'));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refresh_token !== refreshToken) {
      return res
        .status(403)
        .json(baseResponse(403, null, 'Invalid refresh token'));
    }

    const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    const newRefreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' },
    );

    await User.updateToken(user.id, newToken, newRefreshToken);

    res
      .status(200)
      .json(
        baseResponse(
          200,
          { token: newToken, refreshToken: newRefreshToken },
          'Token refreshed',
        ),
      );
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res
        .status(403)
        .json(baseResponse(403, null, 'Refresh token expired'));
    } else {
      return res
        .status(401)
        .json(baseResponse(401, null, 'Invalid refresh token'));
    }
  }
};

module.exports = refreshToken;
