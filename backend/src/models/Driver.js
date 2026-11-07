const pool = require('../config/db');
const uuid = require('../utils/uuid');

const Driver = {
  async create({ name, user_id = null }) {
    const driver_id = uuid();
    await pool.execute(
      'INSERT INTO drivers (driver_id, user_id, name) VALUES (?, ?, ?)',
      [driver_id, user_id, name]
    );
    return driver_id;
  },

  async updateFlag(driver_id, count, status) {
    await pool.execute(
      'UPDATE drivers SET flag_count = ?, flag_status = ? WHERE driver_id = ?',
      [count, status, driver_id]
    );
  },
};

module.exports = Driver;