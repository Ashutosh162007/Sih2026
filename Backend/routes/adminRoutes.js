const express = require('express');
const router = express.Router();
const {
  getPendingVerifications,
  decideVerification,
  getAnalytics,
  getCertificateRequests,
  decideCertificate,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/analytics', getAnalytics);
router.get('/verifications', protect, authorize('admin'), getPendingVerifications);
router.patch('/verifications/:userId', protect, authorize('admin'), decideVerification);
router.get('/certificates', protect, authorize('admin'), getCertificateRequests);
router.patch('/certificates/:projectId', protect, authorize('admin'), decideCertificate);

module.exports = router;
