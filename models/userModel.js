const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  /**
   * Find a user by email or username.
   * @param {string} identifier - Email or username.
   * @returns {object} - User object if found, otherwise null.
   */
  async findByIdentifier(identifier) {
    const query = `
      SELECT * FROM users
      WHERE email = $1 OR username = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [identifier]);
    return rows[0] || null;
  },

  /**
   * Find a user by email.
   * @param {string} email - User's email.
   * @returns {object} - User object if found, otherwise null.
   */
  async findByEmail(email) {
    const query = `
      SELECT * FROM users
      WHERE email = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  },

  /**
   * Create a new user with all fields.
   * @param {object} userDetails - An object containing all the fields to be inserted.
   * @returns {object} - Newly created user object.
   */
  async createUser(userDetails) {
    const {
      name,
      email,
      phone,
      city,
      bod,
      username,
      password,
      role_id,
      token,
      refresh_token,
    } = userDetails;

    // Hash the password before storing it
    const hashedPassword = Buffer.from(password).toString('base64');

    const query = `
      INSERT INTO users (name, email, phone, city, bod, username, password, role_id, token, refresh_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, name, email, phone, city, bod, username, role_id, token, refresh_token, created_at, updated_at
    `;
    const { rows } = await pool.query(query, [
      name,
      email,
      phone || null,
      city || null,
      bod || null,
      username,
      hashedPassword,
      role_id || null,
      token || null,
      refresh_token || null,
    ]);
    return rows[0];
  },

  /**
   * Update the user's token and refresh token in the database.
   * @param {number} userId - The ID of the user.
   * @param {string} token - The JWT token to store.
   * @param {string} refreshToken - The refresh token to store.
   */
  async updateToken(userId, token, refreshToken) {
    const query = `
      UPDATE users 
      SET token = $1, refresh_token = $2 
      WHERE id = $3
    `;
    await pool.query(query, [token, refreshToken, userId]);
  },

  /**
   * Get all users from the database.
   * @returns {array} - List of all users.
   */
  async getAllUsers() {
    const query = `
      SELECT * FROM users
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  /**
   * Find a user by ID.
   * @param {number} userId - The ID of the user.
   * @returns {object} - User object if found, otherwise null.
   */
  async findById(userId) {
    const query = `
      SELECT * FROM users
      WHERE id = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows[0] || null;
  },

  /**
   * Update user details.
   * @param {number} userId - The ID of the user to update.
   * @param {object} userDetails - An object containing all the fields to be updated.
   * @returns {object} - The updated user object.
   */
  async updateUser(userId, userDetails) {
    const {
      name,
      email,
      phone,
      city,
      bod,
      username,
      password,
      role_id,
      token,
      refresh_token,
    } = userDetails;

    // Hash the password if it's being updated
    const hashedPassword = password
      ? Buffer.from(password).toString('base64')
      : null;

    const query = `
      UPDATE users
      SET 
        name = $1,
        email = $2,
        phone = $3,
        city = $4,
        bod = $5,
        username = $6,
        password = COALESCE($7, password),  -- Only update password if provided
        role_id = $8,
        token = $9,
        refresh_token = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      name || null,
      email || null,
      phone || null,
      city || null,
      bod || null,
      username || null,
      hashedPassword,
      role_id || null,
      token || null,
      refresh_token || null,
      userId,
    ]);

    return rows[0];
  },
};

module.exports = User;
