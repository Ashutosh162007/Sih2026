const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Project = require('../models/Project');

// Helper for sparklines
const spark = (seed) =>
  Array.from({ length: 8 }, (_, i) => ({
    i,
    v: 12 + ((seed * (i + 3)) % 18) + i,
  }));

// @desc    Get pending university/industry verification queue
// @route   GET /api/admin/verifications
// @access  Private (Admin)
const getPendingVerifications = async (req, res, next) => {
  try {
    const pending = await User.find({ status: 'pending' }).select('-password');
    res.json(pending);
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject verification
// @route   PATCH /api/admin/verifications/:userId
// @access  Private (Admin)
const decideVerification = async (req, res, next) => {
  try {
    const { decision } = req.body;
    const { userId } = req.params;

    let user = null;
    if (mongoose.isValidObjectId(userId)) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await User.findOne({
        $or: [{ email: userId }, { name: userId }, ...(mongoose.isValidObjectId(userId) ? [{ _id: userId }] : [])],
      });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = decision === 'reject' ? 'rejected' : 'active';
    await user.save();

    res.json({
      id: user._id,
      _id: user._id,
      name: user.name,
      role: user.role,
      status: user.status,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get system-wide analytics & stats
// @route   GET /api/admin/analytics
// @access  Public / Private
const getAnalytics = async (req, res, next) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const openIssues = await Issue.countDocuments({ status: { $ne: 'Resolved' } });
    const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
    const universitiesActive = await User.countDocuments({ role: 'university', status: 'active' });
    const industryPartners = await User.countDocuments({ role: 'industry', status: 'active' });
    const pendingAccounts = await User.countDocuments({ status: 'pending' });

    // Category distribution
    const categoriesGroup = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const categoryMix = categoriesGroup.length > 0
      ? categoriesGroup.map((c) => ({ name: c._id || 'Other', value: c.count }))
      : [
          { name: 'Infrastructure', value: 34 },
          { name: 'Water & Sanitation', value: 24 },
          { name: 'Waste Management', value: 18 },
          { name: 'Public Safety', value: 16 },
          { name: 'Agriculture', value: 12 },
        ];

    // Total funding mobilized
    const fundingAgg = await Project.aggregate([
      { $match: { funded: true } },
      { $group: { _id: null, total: { $sum: '$fundingAmount' } } },
    ]);
    const totalFundingMobilized = fundingAgg[0]?.total || 1450000;

    const stats = [
      { label: 'Open issues', number: openIssues || 128, badgeColor: 'teal', trendData: spark(2), icon: 'alert' },
      { label: 'Universities active', number: universitiesActive || 24, badgeColor: 'blue', trendData: spark(5), icon: 'university' },
      { label: 'Industry partners', number: industryPartners || 17, badgeColor: 'amber', trendData: spark(8), icon: 'industry' },
      { label: 'Resolved this month', number: resolvedIssues || 41, badgeColor: 'green', trendData: spark(3), icon: 'check' },
    ];

    const monthly = [
      { month: 'Mar', reported: 42, resolved: 18 },
      { month: 'Apr', reported: 51, resolved: 27 },
      { month: 'May', reported: 47, resolved: 33 },
      { month: 'Jun', reported: 63, resolved: 29 },
      { month: 'Jul', reported: 58, resolved: 41 },
      { month: 'Aug', reported: 71, resolved: 38 },
    ];

    res.json({
      stats,
      monthly,
      categories: categoryMix,
      openIssues,
      totalIssues,
      pendingAccounts,
      totalFundingMobilized,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get projects requiring CSR Impact Certificate approval
// @route   GET /api/admin/certificates
// @access  Private (Admin)
const getCertificateRequests = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [
        { status: 'Completed' },
        { certificateStatus: { $in: ['pending_approval', 'approved', 'rejected'] } },
      ],
    }).sort({ updatedAt: -1 });

    res.json(projects);
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject project CSR Impact Certificate
// @route   PATCH /api/admin/certificates/:projectId
// @access  Private (Admin)
const decideCertificate = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    let project = null;
    if (mongoose.isValidObjectId(projectId)) {
      project = await Project.findById(projectId);
    }
    if (!project) {
      project = await Project.findOne({
        $or: [
          { issueId: projectId },
          ...(mongoose.isValidObjectId(projectId) ? [{ _id: projectId }] : []),
        ],
      });
    }

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (decision === 'approve') {
      project.certificateStatus = 'approved';
      project.certificateApprovedAt = new Date();
      project.certificateApprovedBy = req.user?.name || req.user?.org || 'Jharkhand State Innovation Council Admin';
    } else {
      project.certificateStatus = 'rejected';
      project.certificateApprovedAt = null;
    }

    if (notes !== undefined) {
      project.certificateNotes = notes;
    }

    await project.save();

    res.json({
      id: project._id,
      _id: project._id,
      title: project.title,
      certificateStatus: project.certificateStatus,
      certificateApprovedAt: project.certificateApprovedAt,
      certificateApprovedBy: project.certificateApprovedBy,
      certificateNotes: project.certificateNotes,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPendingVerifications,
  decideVerification,
  getAnalytics,
  getCertificateRequests,
  decideCertificate,
};
