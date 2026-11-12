const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

router.get('/', auth, ctrl.list);
router.get('/unread', auth, ctrl.unread);
router.patch('/read', auth, ctrl.markAllRead);

module.exports = router;
