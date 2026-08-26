const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['community_reporter', 'university', 'industry', 'admin'],
      default: 'community_reporter',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'rejected'],
      default: function () {
        return ['university', 'industry'].includes(this.role) ? 'pending' : 'active';
      },
    },
    org: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      district: { type: String, default: 'Ranchi' },
      block: { type: String, default: 'Kanke' },
      state: { type: String, default: 'Jharkhand' },
      lat: { type: Number, default: 23.3441 },
      lng: { type: Number, default: 85.3096 },
    },
    disciplines: [{ type: String }],
    contactPhone: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
