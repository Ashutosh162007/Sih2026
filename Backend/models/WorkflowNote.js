const mongoose = require('mongoose');

const WorkflowNoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a note title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide note content'],
    },
    column: {
      type: String,
      enum: ['empathize', 'define', 'ideate', 'prototype', 'test'],
      default: 'ideate',
      required: [true, 'Please provide a board column'],
    },
    authorType: {
      type: String,
      enum: ['university', 'business'],
      default: 'university',
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdByName: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

WorkflowNoteSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model('WorkflowNote', WorkflowNoteSchema);
