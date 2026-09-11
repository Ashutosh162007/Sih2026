const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const {
  previewAI,
  createIssue,
  getIssues,
  getIssueById,
  updateIssueStatus,
  submitFeedback,
  toggleUpvote,
} = require('../controllers/issueController');

router.post('/ai-preview', previewAI);
router.route('/')
  .get(getIssues)
  .post(protect, upload.single('image'), createIssue);

router.route('/:id')
  .get(getIssueById);

router.post('/:id/upvote', toggleUpvote);
router.patch('/:id/status', protect, updateIssueStatus);
router.post('/:id/feedback', submitFeedback);

module.exports = router;
