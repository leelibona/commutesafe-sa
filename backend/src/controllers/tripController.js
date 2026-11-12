const Trip = require('../models/Trip');

exports.active = async (req, res, next) => {
  try {
    res.json(await Trip.active(req.user.user_id));
  } catch (err) { next(err); }
};

exports.history = async (req, res, next) => {
  try {
    res.json(await Trip.recent(req.user.user_id));
  } catch (err) { next(err); }
};

exports.start = async (req, res, next) => {
  try {
    const origin = (req.body.origin || '').trim();
    const destination = (req.body.destination || '').trim();
    const registration_number = (req.body.registration_number || '').trim().toUpperCase() || null;
    const shared_with = Array.isArray(req.body.shared_with) ? req.body.shared_with.slice(0, 5) : [];

    if (!origin || !destination) {
      return res.status(400).json({ error: 'Where are you travelling from and to?' });
    }

    const trip = await Trip.start({
      user_id: req.user.user_id, registration_number, origin, destination, shared_with,
    });
    res.status(201).json(trip);
  } catch (err) { next(err); }
};

exports.arrive = async (req, res, next) => {
  try {
    const ok = await Trip.end(req.user.user_id, req.params.id, 'arrived');
    if (!ok) return res.status(404).json({ error: 'No active trip found' });
    res.json({ message: 'Marked as arrived' });
  } catch (err) { next(err); }
};

exports.cancel = async (req, res, next) => {
  try {
    const ok = await Trip.end(req.user.user_id, req.params.id, 'cancelled');
    if (!ok) return res.status(404).json({ error: 'No active trip found' });
    res.json({ message: 'Trip cancelled' });
  } catch (err) { next(err); }
};
