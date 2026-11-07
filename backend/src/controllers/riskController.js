const axios = require('axios');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

exports.getRouteRisk = async (req, res, next) => {
  try {
    const {
      incident_count = 0,
      avg_severity = 1,
      time_window = 12,
      dow = 0,
    } = req.query;

    const payload = {
      incident_count: parseInt(incident_count) || 0,
      avg_severity: parseFloat(avg_severity) || 1,
      time_window: parseInt(time_window) || 0,
      dow: parseInt(dow) || 0,
    };

    try {
      const { data } = await axios.post(ML_URL + '/predict', payload, { timeout: 5000 });
      return res.json({ risk: data.risk, features: payload, source: 'ml-service' });
    } catch (mlErr) {
      const fallback = payload.incident_count >= 3 || payload.avg_severity >= 2.5
        ? 'High'
        : payload.incident_count >= 2 ? 'Medium' : 'Low';
      return res.json({ risk: fallback, features: payload, source: 'fallback-rule-based' });
    }
  } catch (err) { next(err); }
};