const Notification = require('../models/Notification');

// @desc    Get user/role notifications
// @route   GET /api/notifications
// @access  Private / Public
const getNotifications = async (req, res, next) => {
  try {
    const role = req.user?.role || 'all';
    const userId = req.user?._id;

    const query = {
      $or: [
        { recipientRole: 'all' },
        { recipientRole: role },
        ...(userId ? [{ recipient: userId }] : []),
      ],
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      notification.read = true;
      await notification.save();
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllRead = async (req, res, next) => {
  try {
    const role = req.user?.role || 'all';
    await Notification.updateMany({ recipientRole: { $in: ['all', role] } }, { read: true });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
};
