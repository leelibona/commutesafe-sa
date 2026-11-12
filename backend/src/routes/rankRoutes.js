const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/rankController');

router.get('/', auth, ctrl.list);
router.get('/:id/reports', auth, ctrl.reports);

module.exports = router;
