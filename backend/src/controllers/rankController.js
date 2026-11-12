const Rank = require('../models/Rank');

exports.list = async (req, res, next) => {
  try {
    res.json(await Rank.listWithIncidents());
  } catch (err) { next(err); }
};

exports.reports = async (req, res, next) => {
  try {
    res.json(await Rank.recentReports(req.params.id));
  } catch (err) { next(err); }
};
