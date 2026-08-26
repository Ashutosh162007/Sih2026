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
} = require('../controllers/issueController');

router.post('/ai-preview', previewAI);
router.route('/')
  .get(getIssues)
  .post(protect, upload.single('image'), createIssue);

router.route('/:id')
  .get(getIssueById);

router.patch('/:id/status', protect, updateIssueStatus);

module.exports = router;
