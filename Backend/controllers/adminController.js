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

    // Category distribution (real aggregation; empty array when no data)
    const categoriesGroup = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const categoryMix = categoriesGroup
      .map((c) => ({ name: c._id || 'Other', value: c.count }))
      .sort((a, b) => b.value - a.value);

    // Total funding mobilized (real aggregation; 0 when no funded projects)
    const fundingAgg = await Project.aggregate([
      { $match: { funded: true } },
      { $group: { _id: null, total: { $sum: '$fundingAmount' } } },
    ]);
    const totalFundingMobilized = fundingAgg[0]?.total || 0;

    // Resolved this month (current calendar month, computed from real data)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const resolvedThisMonth = await Issue.countDocuments({
      status: 'Resolved',
      updatedAt: { $gte: monthStart },
    });

    // Monthly reported vs resolved trend over the last 6 months (real data)
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = start.toLocaleString('en', { month: 'short' });
      const [reportedAgg, resolvedAgg] = await Promise.all([
        Issue.aggregate([
          { $match: { createdAt: { $gte: start, $lt: end } } },
          { $count: 'n' },
        ]),
        Issue.aggregate([
          { $match: { status: 'Resolved', updatedAt: { $gte: start, $lt: end } } },
          { $count: 'n' },
        ]),
      ]);
      monthly.push({
        month: label,
        reported: reportedAgg[0]?.n || 0,
        resolved: resolvedAgg[0]?.n || 0,
      });
    }

    const stats = [
      { label: 'Open issues', number: openIssues, badgeColor: 'teal', trendData: spark(2), icon: 'alert' },
      { label: 'Universities active', number: universitiesActive, badgeColor: 'blue', trendData: spark(5), icon: 'university' },
      { label: 'Industry partners', number: industryPartners, badgeColor: 'amber', trendData: spark(8), icon: 'industry' },
      { label: 'Resolved this month', number: resolvedThisMonth, badgeColor: 'green', trendData: spark(3), icon: 'check' },
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
