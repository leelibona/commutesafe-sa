const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/reportController');

router.post('/', auth, ctrl.create);
router.get('/recent/nearby', auth, ctrl.recent);   // BEFORE /:id
router.get('/:id', auth, ctrl.getOne);

module.exports = router;