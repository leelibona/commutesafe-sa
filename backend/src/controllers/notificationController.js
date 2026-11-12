const Notification = require('../models/Notification');

exports.list = async (req, res, next) => {
  try {
    const [items, unread] = await Promise.all([
      Notification.forUser(req.user.user_id),
      Notification.unreadCount(req.user.user_id),
    ]);
    res.json({ items, unread });
  } catch (err) { next(err); }
};

exports.unread = async (req, res, next) => {
  try {
    res.json({ unread: await Notification.unreadCount(req.user.user_id) });
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.markAllRead(req.user.user_id);
    res.json({ message: 'All marked as read' });
  } catch (err) { next(err); }
};
