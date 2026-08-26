const Project = require('../models/Project');

// @desc    Get proposals awaiting industry funding
// @route   GET /api/industry/proposals
// @access  Public / Private
const getProposals = async (req, res, next) => {
  try {
    const proposals = await Project.find({
      status: 'Awaiting funding',
    }).sort({ createdAt: -1 });

    const formatted = proposals.map((p) => ({
      id: p._id,
      _id: p._id,
      issueId: p.issueId,
      title: p.title,
      university: p.university,
      proposal: p.proposal,
      team: p.team,
      status: p.status,
      milestones: p.milestones,
      expectedImpact: p.expectedImpact,
      createdAt: p.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

// @desc    Get industry funded projects
// @route   GET /api/industry/projects
// @access  Public / Private
const getFundedProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      funded: true,
    }).sort({ updatedAt: -1 });

    const formatted = projects.map((p) => ({
      id: p._id,
      _id: p._id,
      issueId: p.issueId,
      title: p.title,
      university: p.university,
      industry: p.industry,
      status: p.status,
      funded: p.funded,
      fundingAmount: p.fundingAmount,
      fundingDate: p.fundingDate,
      deadline: p.deadline,
      proposal: p.proposal,
      team: p.team,
      milestones: p.milestones,
      createdAt: p.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProposals,
  getFundedProjects,
};
