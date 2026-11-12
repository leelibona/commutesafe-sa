const Contact = require('../models/Contact');

// South African numbers: 0XX XXX XXXX or +27 XX XXX XXXX
const normalisePhone = (p = '') => p.replace(/[\s()-]/g, '');
const isValidSAPhone = (p) => /^(\+27|0)[1-9]\d{8}$/.test(p);

exports.list = async (req, res, next) => {
  try {
    res.json(await Contact.forUser(req.user.user_id));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const name = (req.body.name || '').trim();
    const phone = normalisePhone(req.body.phone);
    const relationship = (req.body.relationship || '').trim() || null;

    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (!isValidSAPhone(phone)) {
      return res.status(400).json({ error: 'Enter a valid South African number, e.g. 082 123 4567' });
    }
    if (await Contact.count(req.user.user_id) >= Contact.MAX_CONTACTS) {
      return res.status(400).json({ error: `You can add up to ${Contact.MAX_CONTACTS} contacts` });
    }

    const contact = await Contact.create({ user_id: req.user.user_id, name, phone, relationship });
    res.status(201).json(contact);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const ok = await Contact.remove(req.user.user_id, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Contact not found' });
    res.json({ message: 'Contact removed' });
  } catch (err) { next(err); }
};
