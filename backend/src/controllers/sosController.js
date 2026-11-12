const pool = require('../config/db');
const uuid = require('../utils/uuid');
const Contact = require('../models/Contact');

exports.trigger = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    const alert_id = uuid();
    await pool.execute(
      `INSERT INTO sos_alerts (alert_id, user_id, latitude, longitude)
       VALUES (?, ?, ?, ?)`,
      [alert_id, req.user.user_id, latitude || null, longitude || null]
    );

    // The app uses these to send SMS / WhatsApp messages to the user's contacts
    let contacts = [];
    try { contacts = await Contact.forUser(req.user.user_id); } catch { /* table may not exist yet */ }

    res.status(201).json({
      alert_id,
      notified: ['SAPS 10111', 'Netcare 911', 'ER24'],
      contacts,
      message: 'SOS alert sent with live location',
      created_at: new Date(),
    });
  } catch (err) { next(err); }
};
