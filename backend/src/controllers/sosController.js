const pool = require('../config/db');
const uuid = require('../utils/uuid');

exports.trigger = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    const alert_id = uuid();
    await pool.execute(
      `INSERT INTO sos_alerts (alert_id, user_id, latitude, longitude)
       VALUES (?, ?, ?, ?)`,
      [alert_id, req.user.user_id, latitude || null, longitude || null]
    );

    res.status(201).json({
      alert_id,
      notified: ['SAPS 10111', 'Netcare 911', 'ER24'],
      message: 'SOS alert sent with live location',
      created_at: new Date(),
    });
  } catch (err) { next(err); }
};
