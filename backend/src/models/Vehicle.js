const pool = require('../config/db');
const uuid = require('../utils/uuid');

const Vehicle = {
  async findByRegistration(reg) {
    const [rows] = await pool.execute(
      'SELECT * FROM vehicles WHERE registration_number = ?', [reg]
    );
    return rows[0] || null;
  },

  async create({ driver_id, registration_number }) {
    const vehicle_id = uuid();
    await pool.execute(
      `INSERT INTO vehicles (vehicle_id, driver_id, registration_number)
       VALUES (?, ?, ?)`,
      [vehicle_id, driver_id, registration_number]
    );
    return vehicle_id;
  },

  async getDetails(reg) {
    const [rows] = await pool.execute(
      `SELECT v.registration_number, v.vehicle_id,
              d.driver_id, d.name, d.flag_status, d.flag_count,
              (SELECT COUNT(*) FROM reports WHERE vehicle_id = v.vehicle_id) AS report_count,
              (SELECT category FROM reports WHERE vehicle_id = v.vehicle_id
               ORDER BY created_at DESC LIMIT 1) AS latest_report
       FROM vehicles v
       JOIN drivers d ON v.driver_id = d.driver_id
       WHERE v.registration_number = ?`,
      [reg]
    );
    return rows[0] || null;
  },
};

module.exports = Vehicle;