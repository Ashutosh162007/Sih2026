const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    recipientRole: {
      type: String,
      enum: ['all', 'community_reporter', 'university', 'industry', 'admin'],
      default: 'all',
    },
    issueId: {
      type: String,
      default: null,
    },
    projectId: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['issue_reported', 'team_formed', 'proposal_submitted', 'funding_approved', 'deadline_set', 'milestone_updated', 'issue_resolved', 'account_verified'],
      default: 'issue_reported',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);
