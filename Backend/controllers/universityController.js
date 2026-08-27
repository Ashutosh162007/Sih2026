const Issue = require('../models/Issue');
const Project = require('../models/Project');
const { calculateHaversineDistance } = require('../services/routingService');

// @desc    Get university issue queue (sorted by proximity & relevance)
// @route   GET /api/university/queue
// @access  Public / Private
const getQueue = async (req, res, next) => {
  try {
    const lat = Number(req.query.lat) || req.user?.location?.lat || 23.4123; // default BIT Mesra lat
    const lng = Number(req.query.lng) || req.user?.location?.lng || 85.4399;

    const issues = await Issue.find({
      status: { $in: ['New', 'Under review', 'Assigned'] },
    }).sort({ createdAt: -1 });

    const formatted = issues.map((i) => {
      const distanceKm = calculateHaversineDistance(lat, lng, i.lat, i.lng);
      return {
        id: i._id,
        _id: i._id,
        title: i.title,
        description: i.description,
        aiProblemStatement: i.aiProblemStatement,
        category: i.category,
        status: i.status,
        priority: i.priority,
        severity: i.severity,
        district: i.district,
        block: i.block,
        landmark: i.landmark,
        lat: i.lat,
        lng: i.lng,
        distanceKm,
        assignee: i.assignee,
        nearestUniversities: i.nearestUniversities,
        timeline: i.timeline,
        createdAt: i.createdAt,
      };
    });

    // Sort primarily by distance
    formatted.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

// @desc    Get university projects
// @route   GET /api/university/projects
// @access  Public / Private
const getUniversityProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ updatedAt: -1 });
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
      team: p.team,
      proposal: p.proposal,
      milestones: p.milestones,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
    res.json(formatted);
  } catch (err) {
    next(err);
  }
};

// @desc    Claim an issue from queue
// @route   POST /api/university/issues/:id/claim
// @access  Private (University)
const claimIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    const uniName = req.user?.org || req.user?.name || 'Birla Institute of Technology (BIT) Mesra';

    issue.status = 'Assigned';
    issue.assignee = uniName;
    issue.assigneeId = req.user?._id;
    issue.timeline.push({
      at: new Date(),
      label: `Claimed by ${uniName} for solution design & team formation`,
      actor: uniName,
      role: 'university',
    });

    await issue.save();

    res.json({
      success: true,
      message: 'Issue claimed successfully',
      issue,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getQueue,
  getUniversityProjects,
  claimIssue,
};
