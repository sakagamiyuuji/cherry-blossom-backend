// models/userModel.js
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
      FROM users
      WHERE email = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  },

  /**
   * Create a new user.
   * @param {string} email - User's email.
   * @param {string} username - User's username.
   * @param {string} password - User's password.
   * @returns {object} - Newly created user object.
   */
  async createUser(email, username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (email, username, password)
      VALUES ($1, $2, $3)
      RETURNING id, email, username, bod
    `;
    const { rows } = await pool.query(query, [email, username, hashedPassword]);
    return rows[0];
  },

  /**
   * Update the user's token in the database.
   * @param {number} userId - The ID of the user.
   * @param {string} token - The JWT token to store.
   */
  async updateToken(userId, token) {
    const query = 'UPDATE users SET token = $1 WHERE id = $2';
    await pool.query(query, [token, userId]);
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
};

module.exports = User;
