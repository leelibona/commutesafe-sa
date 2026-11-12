const Report = require('../models/Report');
const { processVehicleFlag } = require('../services/flagService');
const { savePhoto } = require('../services/photoService');

exports.create = async (req, res, next) => {
  try {
    const {
      category, description, photo_base64, location,
      latitude, longitude, registration_number, severity,
    } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Optional photo evidence sent from the app as base64
    const photo_url = photo_base64 ? await savePhoto(photo_base64) : null;

    const baseData = {
      user_id: req.user.user_id,
      category,
      description,
      photo_url,
      location,
      latitude,
      longitude,
      severity: [1, 2, 3].includes(Number(severity)) ? Number(severity) : 1,
    };

    let flag = null;

    if (registration_number) {
      flag = await processVehicleFlag(registration_number, baseData);
    } else {
      await Report.create(baseData);
    }

    res.status(201).json({ message: 'Report submitted', flag });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) { next(err); }
};

exports.mine = async (req, res, next) => {
  try {
    const reports = await Report.forUser(req.user.user_id);
    res.json(reports);
  } catch (err) { next(err); }
};

exports.myStats = async (req, res, next) => {
  try {
    const stats = await Report.statsForUser(req.user.user_id);
    res.json(stats);
  } catch (err) { next(err); }
};

exports.recent = async (req, res, next) => {
  try {
    const reports = await Report.recent(20);
    res.json(reports);
  } catch (err) { next(err); }
};