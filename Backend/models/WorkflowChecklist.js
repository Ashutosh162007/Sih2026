const mongoose = require('mongoose');

// One resource requisition entry on the Execution Request List. Universities
// request concrete resources (materials, equipment, lab access, funds) needed
// to execute the project, and the sponsoring business can fulfill each one.
const WorkflowChecklistItemSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: [true, 'Please describe the required resource'],
      trim: true,
      maxlength: [200, 'Resource cannot exceed 200 characters'],
    },
    why: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Reason cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'provided'],
      default: 'pending',
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'University ID is required'],
    },
    requestedByName: {
      type: String,
      default: '',
    },
    providedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    providedByName: {
      type: String,
      default: '',
    },
    providedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

WorkflowChecklistItemSchema.index({ projectId: 1, createdAt: 1 });

module.exports = mongoose.model('WorkflowChecklistItem', WorkflowChecklistItemSchema);