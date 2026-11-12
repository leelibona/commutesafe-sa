const pool = require('../config/db');
const uuid = require('../utils/uuid');

const User = {
  async create({ email, phone, role, password_hash, name }) {
    const user_id = uuid();
    await pool.execute(
      `INSERT INTO users (user_id, email, phone, role, password_hash, name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, email, phone, role, password_hash, name]
    );
    return { user_id, email, role, name };
  },

  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    return rows[0] || null;
  },

  async findById(user_id) {
    const [rows] = await pool.execute(
      'SELECT user_id, email, phone, role, name, created_at FROM users WHERE user_id = ?',
      [user_id]
    );
    return rows[0] || null;
  },
};

module.exports = User;