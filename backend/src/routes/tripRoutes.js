const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/tripController');

router.get('/active', auth, ctrl.active);
router.get('/', auth, ctrl.history);
router.post('/', auth, ctrl.start);
router.patch('/:id/arrive', auth, ctrl.arrive);
router.patch('/:id/cancel', auth, ctrl.cancel);

module.exports = router;
