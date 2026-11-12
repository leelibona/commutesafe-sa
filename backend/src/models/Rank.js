const pool = require('../config/db');

const Rank = {
  // Every rank plus how many reports in the last 30 days mention its keyword
  async listWithIncidents() {
    const [rows] = await pool.query(
      `SELECT t.rank_id, t.name, t.area, t.latitude, t.longitude, t.routes,
              (SELECT COUNT(*) FROM reports r
                WHERE r.location LIKE CONCAT('%', t.keyword, '%')
                  AND r.created_at >= NOW() - INTERVAL 30 DAY) AS incidents_30d,
              (SELECT MAX(r.created_at) FROM reports r
                WHERE r.location LIKE CONCAT('%', t.keyword, '%')) AS last_incident
       FROM taxi_ranks t
       ORDER BY t.name`
    );
    return rows.map(r => ({
      ...r,
      latitude: r.latitude === null ? null : Number(r.latitude),
      longitude: r.longitude === null ? null : Number(r.longitude),
      incidents_30d: Number(r.incidents_30d),
      routes: r.routes ? r.routes.split(',').map(s => s.trim()) : [],
    }));
  },

  async recentReports(rank_id, limit = 10) {
    const [rows] = await pool.query(
      `SELECT r.report_id, r.category, r.location, r.severity, r.created_at
       FROM reports r
       JOIN taxi_ranks t ON r.location LIKE CONCAT('%', t.keyword, '%')
       WHERE t.rank_id = ?
       ORDER BY r.created_at DESC LIMIT ?`,
      [Number(rank_id), Number(limit)]
    );
    return rows;
  },
};

module.exports = Rank;
