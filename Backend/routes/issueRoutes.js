const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, optionalAuth } = require('../middleware/auth');
const {
  previewAI,
  clubIssues,
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  submitFeedback,
  toggleUpvote,
  addUpward,
  removeUpward,
  getUpwards,
} = require('../controllers/issueController');

router.post('/ai-preview', previewAI);
router.post('/club', protect, clubIssues);
router.route('/')
  .get(optionalAuth, getIssues)
  .post(protect, upload.single('image'), createIssue);

router.route('/:id')
  .get(optionalAuth, getIssueById);

router.post('/:id/upvote', toggleUpvote);
router.patch('/:id/status', protect, updateIssueStatus);
router.post('/:id/feedback', submitFeedback);

router.post('/:id/upward', protect, addUpward);
router.delete('/:id/upward', protect, removeUpward);
router.get('/:id/upwards', optionalAuth, getUpwards);

module.exports = router;
