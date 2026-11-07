const Vehicle = require('../models/Vehicle');

exports.check = async (req, res, next) => {
  try {
    const result = await Vehicle.getDetails(req.params.reg);
    if (!result) {
      return res.json({ status: 'clear', reports: 0, message: 'No reports found' });
    }
    res.json(result);
  } catch (err) { next(err); }
};