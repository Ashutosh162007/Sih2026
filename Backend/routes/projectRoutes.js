const express = require('express');
const router = express.Router();
const {
  saveTeam,
  submitProposal,
  fundProject,
  updateMilestones,
  releaseTranche,
  getProjectById,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.post('/:issueId/teams', protect, saveTeam);
router.post('/:issueId/proposals', protect, submitProposal);
router.post('/:projectId/fund', protect, fundProject);
router.post('/:projectId/tranche-release', protect, releaseTranche);
router.patch('/:projectId/milestones', protect, updateMilestones);
router.get('/:id', getProjectById);

module.exports = router;
