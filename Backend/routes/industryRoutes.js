const express = require('express');
const router = express.Router();
const { getProposals, getFundedProjects } = require('../controllers/industryController');

router.get('/proposals', getProposals);
router.get('/projects', getFundedProjects);

module.exports = router;
