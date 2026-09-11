const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, optionalAuth } = require('../middleware/auth');
const {
  previewAI,
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  submitFeedback,
  addUpward,
  removeUpward,
  getUpwards,
} = require('../controllers/issueController');

router.post('/ai-preview', previewAI);
router.route('/')
  .get(optionalAuth, getIssues)
  .post(protect, upload.single('image'), createIssue);

router.route('/:id')
  .get(optionalAuth, getIssueById);

router.patch('/:id/status', protect, updateIssueStatus);
router.post('/:id/feedback', submitFeedback);

// Upwards (Upvote) endpoints
router.post('/:id/upward', protect, addUpward);
router.delete('/:id/upward', protect, removeUpward);
router.get('/:id/upwards', optionalAuth, getUpwards);

module.exports = router;
