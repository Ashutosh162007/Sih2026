const mongoose = require('mongoose');

const RoutingAssignmentSchema = new mongoose.Schema(
  {
    issueId: {
      type: String,
      required: true,
    },
    suggestedUniversities: [
      {
        universityId: String,
        name: String,
        distanceKm: Number,
        disciplineScore: Number,
        compositeScore: Number,
      },
    ],
    selectedUniversity: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['queued', 'claimed', 'transferred', 'expired'],
      default: 'queued',
    },
    routedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

RoutingAssignmentSchema.index({ issueId: 1 }, { unique: true });
RoutingAssignmentSchema.index({ status: 1, routedAt: -1 });

module.exports = mongoose.model('RoutingAssignment', RoutingAssignmentSchema);
