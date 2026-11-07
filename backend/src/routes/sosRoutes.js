const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/sosController');

router.post('/', auth, ctrl.trigger);

module.exports = router;