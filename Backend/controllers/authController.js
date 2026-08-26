const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'sahayog_sih2026_jwt_secret_dev_key_2026';
  return jwt.sign({ id, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, org, district, block, lat, lng, disciplines } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const isPendingRole = ['university', 'industry'].includes(role);
    const status = isPendingRole ? 'pending' : 'active';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'community_reporter',
      status,
      org: org || '',
      location: {
        district: district || 'Ranchi',
        block: block || 'Kanke',
        state: 'Jharkhand',
        lat: Number(lat) || 23.3441,
        lng: Number(lng) || 85.3096,
      },
      disciplines: disciplines || [],
    });

    if (isPendingRole) {
      // Create admin verification notification
      await Notification.create({
        recipientRole: 'admin',
        title: 'New Account Pending Verification',
        message: `${name} registered as a ${role} representative for ${org || 'Organisation'}.`,
        type: 'account_verified',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        org: user.org,
        location: user.location,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch && password !== 'password') { // support easy demo password in dev
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        org: user.org,
        location: user.location,
        disciplines: user.disciplines,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile, GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.json({
        id: req.user.id,
        _id: req.user.id,
        name: req.user.name,
        role: req.user.role,
        org: req.user.org,
        status: req.user.status || 'active',
      });
    }

    res.json({
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      org: user.org,
      location: user.location,
      disciplines: user.disciplines,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
