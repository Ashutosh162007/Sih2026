const mongoose = require('mongoose');

const WorkflowSuggestionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkflowNote',
      required: [true, 'Note ID is required'],
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'University ID is required'],
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Business ID is required'],
    },
    businessName: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Please provide a suggestion message'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

WorkflowSuggestionSchema.index({ noteId: 1, createdAt: -1 });
WorkflowSuggestionSchema.index({ projectId: 1, status: 1 });

module.exports = mongoose.model('WorkflowSuggestion', WorkflowSuggestionSchema);
