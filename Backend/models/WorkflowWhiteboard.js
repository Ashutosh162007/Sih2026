const mongoose = require('mongoose');

const WhiteboardObjectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    kind: {
      type: String,
      enum: ['stroke', 'rect', 'ellipse', 'arrow', 'text'],
      required: true,
    },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    w: { type: Number, default: 0 },
    h: { type: Number, default: 0 },
    x2: { type: Number, default: 0 },
    y2: { type: Number, default: 0 },
    points: {
      type: [
        new mongoose.Schema({ x: Number, y: Number }, { _id: false }),
      ],
      default: [],
    },
    text: { type: String, default: '' },
    fontSize: { type: Number, default: 20 },
    color: { type: String, default: '#0E4B4C' },
    strokeWidth: { type: Number, default: 3 },
  },
  { _id: false }
);

// One visual whiteboard / canvas per project. The owning university builds it
// freely with freehand strokes, shapes, arrows and short text labels.
// Businesses and admin/gov can only view + (businesses) suggest changes.
const WorkflowWhiteboardSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Whiteboard must belong to a project'],
      unique: true,
    },
    projectId: {
      type: String,
      required: [true, 'Project id is required'],
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    universityName: {
      type: String,
      default: '',
    },
    objects: { type: [WhiteboardObjectSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WorkflowWhiteboard', WorkflowWhiteboardSchema);