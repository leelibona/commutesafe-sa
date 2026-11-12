const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/reportController');

router.post('/', auth, ctrl.create);
router.get('/recent/nearby', auth, ctrl.recent);   // BEFORE /:id
router.get('/mine', auth, ctrl.mine);               // BEFORE /:id
router.get('/stats/mine', auth, ctrl.myStats);      // BEFORE /:id
router.get('/:id', auth, ctrl.getOne);

module.exports = router;