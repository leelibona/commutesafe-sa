const axios = require('axios');
const Report = require('../models/Report');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

exports.getRouteRisk = async (req, res, next) => {
  try {
    let {
      incident_count,
      avg_severity,
      time_window = 12,
      dow = 0,
    } = req.query;

    // If the app doesn't supply incident numbers, use real reports from the last 7 days
    let dataSource = 'query';
    if (incident_count === undefined) {
      const live = await Report.recentRiskFeatures(7);
      incident_count = live.incident_count;
      avg_severity = live.avg_severity;
      dataSource = 'live-reports';
    }

    const payload = {
      incident_count: parseInt(incident_count) || 0,
      avg_severity: parseFloat(avg_severity) || 1,
      time_window: parseInt(time_window) || 0,
      dow: parseInt(dow) || 0,
    };

    try {
      const { data } = await axios.post(ML_URL + '/predict', payload, { timeout: 5000 });
      return res.json({ risk: data.risk, features: payload, source: 'ml-service', data_source: dataSource });
    } catch (mlErr) {
      const fallback = payload.incident_count >= 3 || payload.avg_severity >= 2.5
        ? 'High'
        : payload.incident_count >= 2 ? 'Medium' : 'Low';
      return res.json({ risk: fallback, features: payload, source: 'fallback-rule-based', data_source: dataSource });
    }
  } catch (err) { next(err); }
};