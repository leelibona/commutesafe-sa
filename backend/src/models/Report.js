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

  // Distinct users who have reported a vehicle (used for notifications)
  async reportersForVehicle(vehicle_id) {
    const [rows] = await pool.query(
      'SELECT DISTINCT user_id FROM reports WHERE vehicle_id = ? AND user_id IS NOT NULL',
      [vehicle_id]
    );
    return rows.map(r => r.user_id);
  },

  async countForVehicle(vehicle_id) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS cnt FROM reports WHERE vehicle_id = ?',
      [vehicle_id]
    );
    return rows[0].cnt;
  },

  async recent(limit = 20) {
    const [rows] = await pool.query(
      `SELECT report_id, category, location, severity, latitude, longitude, created_at
       FROM reports ORDER BY created_at DESC LIMIT ?`,
      [Number(limit)]
    );
    return rows;
  },

  // All reports submitted by one user, newest first, with vehicle + flag info
  async forUser(user_id, limit = 50) {
    const [rows] = await pool.query(
      `SELECT r.report_id, r.category, r.description, r.location, r.severity,
              r.photo_url, r.created_at, v.registration_number, d.flag_status
       FROM reports r
       LEFT JOIN vehicles v ON v.vehicle_id = r.vehicle_id
       LEFT JOIN drivers d ON d.driver_id = v.driver_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC
       LIMIT ?`,
      [user_id, Number(limit)]
    );
    return rows;
  },

  // Numbers shown on the Profile screen
  async statsForUser(user_id) {
    const [[reports]] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM reports WHERE user_id = ?', [user_id]
    );
    const [[sos]] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM sos_alerts WHERE user_id = ?', [user_id]
    );
    const [[flagged]] = await pool.query(
      `SELECT COUNT(DISTINCT v.vehicle_id) AS cnt
       FROM reports r
       JOIN vehicles v ON v.vehicle_id = r.vehicle_id
       JOIN drivers d ON d.driver_id = v.driver_id
       WHERE r.user_id = ? AND d.flag_status = 'flagged'`,
      [user_id]
    );
    return {
      reports: Number(reports.cnt),
      sos_alerts: Number(sos.cnt),
      vehicles_flagged: Number(flagged.cnt),
    };
  },

  // Incident count + average severity over the last N days (feeds the ML model)
  async recentRiskFeatures(days = 7) {
    const [[row]] = await pool.query(
      `SELECT COUNT(*) AS incident_count, COALESCE(AVG(severity), 1) AS avg_severity
       FROM reports
       WHERE created_at >= NOW() - INTERVAL ? DAY`,
      [Number(days)]
    );
    return {
      incident_count: Number(row.incident_count),
      avg_severity: Math.round(Number(row.avg_severity) * 10) / 10,
    };
  },
};

module.exports = Report;