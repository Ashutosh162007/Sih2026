const express = require('express');
const router = express.Router();
const {
  listWorkflowProjects,
  getWorkflowProject,
  saveWorkflowCanvas,
  createSuggestion,
  updateSuggestionStatus,
} = require('../controllers/workflowController');
const { protect } = require('../middleware/auth');

// All workflow routes are private: universities, industry partners and
// admin only. Role-based rules are enforced inside the controller.
router.get('/projects', protect, listWorkflowProjects);
router.get('/projects/:projectId', protect, getWorkflowProject);

router.put('/projects/:projectId/canvas', protect, saveWorkflowCanvas);

router.post('/projects/:projectId/suggestions', protect, createSuggestion);
router.patch('/suggestions/:suggestionId', protect, updateSuggestionStatus);

module.exports = router;