const express = require('express');
const router = express.Router();
const {
  getPendingVerifications,
  decideVerification,
  getAnalytics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.get('/verifications', protect, authorize('admin'), getPendingVerifications);
router.patch('/verifications/:userId', protect, authorize('admin'), decideVerification);

module.exports = router;
