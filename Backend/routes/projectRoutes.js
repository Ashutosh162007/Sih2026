const express = require('express');
const router = express.Router();
const {
  saveTeam,
  submitProposal,
  fundProject,
  updateMilestones,
  getProjectById,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.post('/:issueId/teams', protect, authorize('university'), saveTeam);
router.post('/:issueId/proposals', protect, authorize('university'), submitProposal);
router.post('/:projectId/fund', protect, authorize('industry'), fundProject);
router.patch('/:projectId/milestones', protect, authorize('university'), updateMilestones);
router.get('/:id', getProjectById);

module.exports = router;
