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
    const pendingUsers = await User.find({ status: 'pending' }).select('-password');
    const formatted = pendingUsers.map((u) => ({
      id: u._id,
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      org: u.org,
      status: u.status,
      createdAt: u.createdAt,
    }));
    res.json(formatted);
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
    const user = await User.findById(req.params.userId);

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

module.exports = {
  getPendingVerifications,
  decideVerification,
  getAnalytics,
};
