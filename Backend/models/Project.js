const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: false,
    },
    issueId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    university: {
      type: String,
      required: [true, 'University name is required'],
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    industry: {
      type: String,
      default: null,
    },
    industryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Team forming', 'Awaiting funding', 'Funded', 'In progress', 'Completed'],
      default: 'Team forming',
    },
    funded: {
      type: Boolean,
      default: false,
    },
    fundingAmount: {
      type: Number,
      default: 0,
    },
    fundingDate: {
      type: Date,
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },
    mentorshipNotes: {
      type: String,
      default: '',
    },
    team: [
      {
        discipline: { type: String, required: true },
        members: [{ type: String }],
      },
    ],
    proposal: {
      type: String,
      default: '',
    },
    expectedImpact: {
      type: String,
      default: '',
    },
    milestones: [
      {
        name: { type: String, required: true },
        due: { type: String, required: true },
        done: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
        notes: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProjectSchema.index({ issueId: 1 }, { unique: true });
ProjectSchema.index({ status: 1, createdAt: -1 });
ProjectSchema.index({ universityId: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
