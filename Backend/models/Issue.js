const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an issue title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide issue details/description'],
    },
    aiProblemStatement: {
      type: String,
      default: '',
    },
    aiSummary: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Please select an issue category'],
      enum: [
        'Infrastructure',
        'Water & Sanitation',
        'Waste Management',
        'Public Safety',
        'Environment',
        'Agriculture',
        'Healthcare',
        'Education',
        'Rural Livelihoods',
        'Mobility',
        'Other',
      ],
      default: 'Infrastructure',
    },
    status: {
      type: String,
      enum: ['New', 'Under review', 'Assigned', 'In progress', 'Resolved'],
      default: 'New',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    severity: {
      flooding: { type: Number, default: 40 },
      publicRisk: { type: Number, default: 50 },
      urgency: { type: Number, default: 50 },
      score: { type: Number, default: 46 },
      factors: [{ type: String }],
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reporterId: {
      type: String,
    },
    reporterName: {
      type: String,
      default: 'Citizen Reporter',
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      default: 'Ranchi',
    },
    block: {
      type: String,
      required: [true, 'Block is required'],
      default: 'Kanke',
    },
    landmark: {
      type: String,
      default: '',
    },
    lat: {
      type: Number,
      default: 23.3441,
    },
    lng: {
      type: Number,
      default: 85.3096,
    },
    images: [
      {
        url: { type: String },
        filename: { type: String },
        size: { type: Number },
      },
    ],
    assignee: {
      type: String,
      default: null,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    nearestUniversities: [
      {
        universityId: { type: String },
        name: { type: String },
        distanceKm: { type: Number },
        district: { type: String },
        matchScore: { type: Number },
      },
    ],
    timeline: [
      {
        at: { type: Date, default: Date.now },
        label: { type: String, required: true },
        actor: { type: String },
        role: { type: String },
      },
    ],
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: '' },
      verifiedByCitizen: { type: Boolean, default: true },
      submittedAt: { type: Date },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Issue', IssueSchema);
