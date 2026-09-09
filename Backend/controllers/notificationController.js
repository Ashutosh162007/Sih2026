const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get user/role notifications
// @route   GET /api/notifications
// @access  Private / Public
const getNotifications = async (req, res, next) => {
  try {
    let role = req.user?.role || 'all';
    let userId = req.user?._id;

    // Check authorization header if req.user wasn't already populated
    if (!req.user && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        if (token.startsWith('mock-')) {
          role = token.includes('admin') ? 'admin' : token.includes('industry') ? 'industry' : token.includes('university') ? 'university' : 'citizen';
        } else {
          try {
            const parsed = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
            if (parsed?.role) role = parsed.role;
            if (parsed?.id) userId = parsed.id;
          } catch (_) {
            try {
              const secret = process.env.JWT_SECRET || 'sahayog_sih2026_jwt_secret_dev_key_2026';
              const decoded = jwt.verify(token, secret);
              if (decoded) {
                const u = await User.findById(decoded.id);
                if (u) {
                  role = u.role;
                  userId = u._id;
                }
              }
            } catch (_) {}
          }
        }
      }
    }

    const query = {
      $or: [
        { recipientRole: 'all' },
        { recipientRole: role },
        ...(userId && mongoose.isValidObjectId(userId) ? [{ recipient: userId }] : []),
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
    if (mongoose.isValidObjectId(req.params.id)) {
      const notification = await Notification.findById(req.params.id);
      if (notification) {
        notification.read = true;
        await notification.save();
      }
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
