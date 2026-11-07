const pool = require('../config/db');
const uuid = require('../utils/uuid');

const Report = {
  async create(data) {
    const report_id = uuid();
    await pool.execute(
      `INSERT INTO reports
        (report_id, user_id, vehicle_id, category, description,
         photo_url, location, latitude, longitude, severity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        report_id,
        data.user_id,
        data.vehicle_id || null,
        data.category,
        data.description || null,
        data.photo_url || null,
        data.location || null,
        data.latitude || null,
        data.longitude || null,
        data.severity || 1,
      ]
    );
    return report_id;
  },

  async findById(report_id) {
    const [rows] = await pool.execute(
      'SELECT * FROM reports WHERE report_id = ?', [report_id]
    );
    return rows[0] || null;
  },

  async countForVehicle(vehicle_id) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS cnt FROM reports WHERE vehicle_id = ?',
      [vehicle_id]
    );
    return rows[0].cnt;
  },

  async recent(limit = 20) {
    const [rows] = await pool.execute(
      `SELECT report_id, category, location, created_at
       FROM reports ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );
    return rows;
  },
};

module.exports = Report;