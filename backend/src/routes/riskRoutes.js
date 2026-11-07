const router = require('express').Router();
const ctrl = require('../controllers/riskController');

router.get('/route', ctrl.getRouteRisk);

module.exports = router;