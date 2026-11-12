const pool = require('../config/db');
const uuid = require('../utils/uuid');

const parse = (row) => row && ({
  ...row,
  shared_with: row.shared_with ? JSON.parse(row.shared_with) : [],
});

const Trip = {
  async active(user_id) {
    const [rows] = await pool.query(
      `SELECT * FROM trips WHERE user_id = ? AND status = 'active'
       ORDER BY started_at DESC LIMIT 1`,
      [user_id]
    );
    return parse(rows[0]) || null;
  },

  async recent(user_id, limit = 10) {
    const [rows] = await pool.query(
      `SELECT * FROM trips WHERE user_id = ? ORDER BY started_at DESC LIMIT ?`,
      [user_id, Number(limit)]
    );
    return rows.map(parse);
  },

  async start({ user_id, registration_number, origin, destination, shared_with }) {
    // Only one active trip at a time: close any previous one
    await pool.query(
      `UPDATE trips SET status = 'cancelled', ended_at = NOW()
       WHERE user_id = ? AND status = 'active'`,
      [user_id]
    );
    const trip_id = uuid();
    await pool.query(
      `INSERT INTO trips (trip_id, user_id, registration_number, origin, destination, shared_with)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [trip_id, user_id, registration_number || null, origin, destination, JSON.stringify(shared_with || [])]
    );
    return this.findById(user_id, trip_id);
  },

  async findById(user_id, trip_id) {
    const [rows] = await pool.query(
      'SELECT * FROM trips WHERE trip_id = ? AND user_id = ?', [trip_id, user_id]
    );
    return parse(rows[0]) || null;
  },

  async end(user_id, trip_id, status) {
    const [res] = await pool.query(
      `UPDATE trips SET status = ?, ended_at = NOW()
       WHERE trip_id = ? AND user_id = ? AND status = 'active'`,
      [status, trip_id, user_id]
    );
    return res.affectedRows > 0;
  },
};

module.exports = Trip;
