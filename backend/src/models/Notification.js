const pool = require('../config/db');
const uuid = require('../utils/uuid');

const Notification = {
  async create({ user_id, type, title, body }) {
    const notification_id = uuid();
    await pool.query(
      `INSERT INTO notifications (notification_id, user_id, type, title, body)
       VALUES (?, ?, ?, ?, ?)`,
      [notification_id, user_id, type, title, body || null]
    );
    return notification_id;
  },

  // Send the same notification to several users (skips duplicates / nulls)
  async createMany(user_ids, data) {
    const unique = [...new Set(user_ids.filter(Boolean))];
    for (const user_id of unique) {
      await this.create({ ...data, user_id });
    }
    return unique.length;
  },

  async forUser(user_id, limit = 50) {
    const [rows] = await pool.query(
      `SELECT notification_id, type, title, body, is_read, created_at
       FROM notifications WHERE user_id = ?
       ORDER BY created_at DESC LIMIT ?`,
      [user_id, Number(limit)]
    );
    return rows.map(r => ({ ...r, is_read: !!r.is_read }));
  },

  async unreadCount(user_id) {
    const [[row]] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = 0',
      [user_id]
    );
    return Number(row.cnt);
  },

  async markAllRead(user_id) {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [user_id]);
  },
};

module.exports = Notification;
