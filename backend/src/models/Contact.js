const pool = require('../config/db');
const uuid = require('../utils/uuid');

const MAX_CONTACTS = 5;

const Contact = {
  MAX_CONTACTS,

  async forUser(user_id) {
    const [rows] = await pool.query(
      `SELECT contact_id, name, phone, relationship, created_at
       FROM emergency_contacts WHERE user_id = ? ORDER BY created_at ASC`,
      [user_id]
    );
    return rows;
  },

  async count(user_id) {
    const [[row]] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM emergency_contacts WHERE user_id = ?', [user_id]
    );
    return Number(row.cnt);
  },

  async create({ user_id, name, phone, relationship }) {
    const contact_id = uuid();
    await pool.query(
      `INSERT INTO emergency_contacts (contact_id, user_id, name, phone, relationship)
       VALUES (?, ?, ?, ?, ?)`,
      [contact_id, user_id, name, phone, relationship || null]
    );
    return { contact_id, name, phone, relationship: relationship || null };
  },

  // Only deletes if the contact belongs to this user
  async remove(user_id, contact_id) {
    const [res] = await pool.query(
      'DELETE FROM emergency_contacts WHERE contact_id = ? AND user_id = ?',
      [contact_id, user_id]
    );
    return res.affectedRows > 0;
  },
};

module.exports = Contact;
