const router = require('express').Router();
const ctrl = require('../controllers/vehicleController');

router.get('/:reg', ctrl.check);

module.exports = router;