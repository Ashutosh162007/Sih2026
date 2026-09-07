const express = require('express');
const router = express.Router();
const { getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.get('/profile', protect, getMe);

// Get list of registered universities
router.get('/universities', async (req, res, next) => {
  try {
    const universities = await User.find({ role: 'university', status: 'active' }).select('-password');
    res.json({ success: true, count: universities.length, data: universities });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
