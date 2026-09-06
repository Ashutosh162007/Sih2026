const express = require('express');
const router = express.Router();
const { getQueue, getUniversityProjects, claimIssue } = require('../controllers/universityController');
const { protect, authorize } = require('../middleware/auth');

router.get('/queue', getQueue);
router.get('/projects', getUniversityProjects);
router.post('/issues/:id/claim', protect, authorize('university'), claimIssue);

module.exports = router;
