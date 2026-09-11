const mongoose = require('mongoose');

const IssueUpwardSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index — one Upward per user per issue
IssueUpwardSchema.index({ issueId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('IssueUpward', IssueUpwardSchema);
