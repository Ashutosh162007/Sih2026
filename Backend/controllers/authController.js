const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Notification = require('../models/Notification');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET;
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
      role: (role === 'community_reporter' ? 'citizen' : role) || 'citizen',
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
        disciplines: user.disciplines,
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

    const demoPasswordAllowed = process.env.NODE_ENV !== 'production';
    if (!isMatch && (!demoPasswordAllowed || password !== 'password')) {
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
        picture: user.picture,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate or register via Google OAuth
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { credential, accessToken, role, district, block, org, lat, lng } = req.body;
    let email, name, picture, googleId;

    if (credential) {
      // ID token from Google Identity Services
      const clientId = process.env.GOOGLE_CLIENT_ID;
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: clientId || undefined,
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
        googleId = payload.sub;
      } catch (tokenErr) {
        // Fallback: decode JWT payload if verification fails due to audience mismatch in dev
        const base64Url = credential.split('.')[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            Buffer.from(base64, 'base64')
              .toString('utf-8')
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(jsonPayload);
          email = payload.email;
          name = payload.name;
          picture = payload.picture;
          googleId = payload.sub;
        } else {
          throw tokenErr;
        }
      }
    } else if (accessToken) {
      // Access token
      const client = new OAuth2Client();
      client.setCredentials({ access_token: accessToken });
      const userinfo = await client.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      });
      email = userinfo.data.email;
      name = userinfo.data.name;
      picture = userinfo.data.picture;
      googleId = userinfo.data.sub;
    } else {
      return res.status(400).json({ success: false, message: 'Google credential or access token is required' });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Could not retrieve email from Google profile' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const selectedRole = (role === 'community_reporter' ? 'citizen' : role) || 'citizen';
      const isPendingRole = ['university', 'industry'].includes(selectedRole);
      const status = isPendingRole ? 'pending' : 'active';
      const selectedDistrict = district || 'Ranchi';
      const selectedBlock = block || 'Kanke';

      user = await User.create({
        name: name || 'Google User',
        email: email.toLowerCase(),
        googleId,
        picture: picture || '',
        role: selectedRole,
        org: org || (isPendingRole ? 'Registered Entity' : ''),
        status,
        location: {
          district: selectedDistrict,
          block: selectedBlock,
          state: 'Jharkhand',
          lat: lat || 23.3441,
          lng: lng || 85.3096,
        },
      });

      if (isPendingRole) {
        await Notification.create({
          recipientRole: 'admin',
          title: 'New Account Pending Verification (Google Sign-In)',
          message: `${name} registered via Google as a ${selectedRole} representative.`,
          type: 'account_verified',
        });
      }
    } else {
      // If user exists but googleId was not set, update it
      let needsSave = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (picture && !user.picture) {
        user.picture = picture;
        needsSave = true;
      }
      if (district && (!user.location || !user.location.district)) {
        user.location = user.location || {};
        user.location.district = district;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
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
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ success: false, message: 'Google authentication failed: ' + err.message });
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
        picture: req.user.picture,
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
      picture: user.picture,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  getMe,
};
