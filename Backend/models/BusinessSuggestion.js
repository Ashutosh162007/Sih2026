const mongoose = require('mongoose');

// A business (industry) partner submits a suggestion/request against a
// project's workflow. Businesses cannot edit the workflow graph directly;
// they recommend changes that the owning university can review, accept or
// reject.
const BusinessSuggestionSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    projectId: {
      type: String,
      required: [true, 'Project id is required'],
      index: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    universityId: {
      type: String,
      default: '',
    },
    universityName: {
      type: String,
      default: '',
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Business user is required'],
    },
    businessName: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Suggestion message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
    statusUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('BusinessSuggestion', BusinessSuggestionSchema);