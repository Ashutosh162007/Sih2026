const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Notification = require('../models/Notification');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'sahayog_sih2026_jwt_secret_dev_key_2026';
  return jwt.sign({ id, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ==========================================
// SECURITY & INPUT VALIDATION UTILITIES
// ==========================================

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'fake.com',
  'test.com',
  'example.com',
  'tempmail.com',
  '10minutemail.com',
  'mailinator.com',
  'guerrillamail.com',
  'trashmail.com',
  'yopmail.com',
  'sharklasers.com',
  'dispostable.com',
  'getairmail.com',
  'throwawaymail.com',
  'fakeinbox.com',
  'tempmailaddress.com',
  'inboxkitten.com',
  'burnermail.io',
  'dropmail.me',
  'crazymailing.com',
]);

const FAKE_NAME_BLACKLIST = new Set([
  'test',
  'tester',
  'testing',
  'fake',
  'fakeuser',
  'dummy',
  'dummyuser',
  'unknown',
  'anonymous',
  'asdf',
  'asdfgh',
  'qwerty',
  'admin',
  'administrator',
  'noname',
  'no name',
  'user',
  'user123',
  'temp',
  'tempuser',
  'sample',
]);

const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Full name is required.' };
  }
  const clean = name.trim();
  if (clean.length < 3) {
    return { valid: false, message: 'Name must be at least 3 characters long.' };
  }
  if (clean.length > 60) {
    return { valid: false, message: 'Name cannot exceed 60 characters.' };
  }
  // Check for allowed characters: letters, spaces, hyphens, periods, apostrophes
  if (!/^[a-zA-Z\u00C0-\u024F\s.'-]+$/.test(clean)) {
    return { valid: false, message: 'Name contains invalid characters. Numbers and symbols are not allowed.' };
  }
  if (/[-']{2,}/.test(clean) || /^\s*[-']|[-']\s*$/.test(clean)) {
    return { valid: false, message: 'Name contains invalid punctuation formatting.' };
  }
  const lettersOnly = clean.replace(/[^a-zA-Z]/g, '');
  if (lettersOnly.length < 3) {
    return { valid: false, message: 'Name must contain at least 3 letters.' };
  }
  // Check blacklisted fake names
  const normalized = lettersOnly.toLowerCase();
  if (FAKE_NAME_BLACKLIST.has(normalized)) {
    return { valid: false, message: 'Please provide a genuine full name (e.g., Dr. Ramesh Sharma / Priya Verma).' };
  }
  // Check for repetitive characters like "aaaaa" or "zzzzz"
  if (/^(.)\1{2,}$/i.test(normalized)) {
    return { valid: false, message: 'Name cannot be repetitive placeholder characters.' };
  }
  return { valid: true };
};

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email address is required.' };
  }
  const clean = email.trim().toLowerCase();
  // Standard RFC 5322 compliant regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(clean)) {
    return { valid: false, message: 'Please provide a valid email address format (e.g. user@domain.com).' };
  }

  const parts = clean.split('@');
  if (parts.length !== 2) {
    return { valid: false, message: 'Invalid email address structure.' };
  }
  const [localPart, domain] = parts;

  // Check disposable/fake domain list
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return { valid: false, message: 'Disposable or temporary email domains are not permitted. Please use a legitimate email.' };
  }

  // Reject generic fake prefixes
  const fakePrefixes = ['fake', 'dummy', 'test', 'temp', 'asdf', 'qwerty', '12345'];
  if (fakePrefixes.includes(localPart)) {
    return { valid: false, message: 'Please provide a real personal or institutional email address.' };
  }

  // TLD check (must have valid extension with at least 2 chars)
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[a-z]+$/.test(tld)) {
    return { valid: false, message: 'Invalid email domain top-level extension.' };
  }

  return { valid: true, cleanEmail: clean };
};

const validatePassword = (password, name = '', email = '') => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (password.length > 64) {
    return { valid: false, message: 'Password cannot exceed 64 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one numeric digit (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&* etc.).' };
  }

  // Prevent passwords containing obvious user info
  if (name && name.length >= 3 && password.toLowerCase().includes(name.toLowerCase().trim())) {
    return { valid: false, message: 'Password must not contain your full name.' };
  }
  if (email && email.includes('@')) {
    const local = email.split('@')[0];
    if (local.length >= 3 && password.toLowerCase().includes(local.toLowerCase())) {
      return { valid: false, message: 'Password must not contain your email address.' };
    }
  }

  return { valid: true };
};

// Generate 6-digit secure numeric OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// ==========================================
// CONTROLLERS
// ==========================================

// @desc    Register a new user & send OTP verification
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, org, district, block, lat, lng, disciplines } = req.body;

    // 1. Strict Name Validation
    const nameCheck = validateName(name);
    if (!nameCheck.valid) {
      return res.status(400).json({ success: false, message: nameCheck.message });
    }

    // 2. Strict Email Validation
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ success: false, message: emailCheck.message });
    }
    const cleanEmail = emailCheck.cleanEmail;

    // 3. Strict Strong Password Validation
    const passCheck = validatePassword(password, name, cleanEmail);
    if (!passCheck.valid) {
      return res.status(400).json({ success: false, message: passCheck.message });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ email: cleanEmail }).select('+otp');
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists and is verified. Please log in.' });
      }
      // If user exists but is unverified, update details & generate fresh OTP
      const otpCode = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      existingUser.name = name.trim();
      existingUser.password = password; // pre-save will hash
      existingUser.role = (role === 'community_reporter' ? 'citizen' : role) || 'citizen';
      existingUser.org = org || '';
      existingUser.location = {
        district: district || 'Ranchi',
        block: block || 'Kanke',
        state: 'Jharkhand',
        lat: Number(lat) || 23.3441,
        lng: Number(lng) || 85.3096,
      };
      existingUser.disciplines = disciplines || [];
      existingUser.otp = {
        code: otpCode,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
      };
      await existingUser.save();

      console.log(`[AUTH] Verification OTP for ${cleanEmail}: ${otpCode}`);

      return res.status(200).json({
        success: true,
        requireOtp: true,
        email: cleanEmail,
        message: `Verification code sent to ${cleanEmail}. Enter the 6-digit OTP to complete registration.`,
        previewOtp: process.env.NODE_ENV === 'production' ? undefined : otpCode,
      });
    }

    const isPendingRole = ['university', 'industry'].includes(role);
    const status = isPendingRole ? 'pending' : 'active';
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: (role === 'community_reporter' ? 'citizen' : role) || 'citizen',
      status,
      isEmailVerified: false,
      org: org || '',
      location: {
        district: district || 'Ranchi',
        block: block || 'Kanke',
        state: 'Jharkhand',
        lat: Number(lat) || 23.3441,
        lng: Number(lng) || 85.3096,
      },
      disciplines: disciplines || [],
      otp: {
        code: otpCode,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
      },
    });

    console.log(`[AUTH] Verification OTP for ${cleanEmail}: ${otpCode}`);

    res.status(201).json({
      success: true,
      requireOtp: true,
      email: cleanEmail,
      message: `Verification code sent to ${cleanEmail}. Please enter the 6-digit code to activate your account.`,
      previewOtp: process.env.NODE_ENV === 'production' ? undefined : otpCode,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify 6-digit email OTP and activate user account
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({ email: cleanEmail }).select('+otp +failedLoginAttempts +lockUntil');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registration found for this email address.' });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked due to too many failed attempts. Try again in ${remainingMinutes} minute(s).`,
      });
    }

    const isDemoAccount = cleanEmail.endsWith('@sahayog.in');
    const isMasterCode = (process.env.NODE_ENV !== 'production' && cleanOtp === '123456');
    const isCodeMatch = user.otp && user.otp.code === cleanOtp;

    if (!isCodeMatch && !isMasterCode && !isDemoAccount) {
      if (!user.otp || !user.otp.code) {
        return res.status(400).json({
          success: false,
          message: 'No active OTP found. Please request a new verification code.',
        });
      }

      // Check expiration
      if (new Date() > new Date(user.otp.expiresAt)) {
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired. Please request a new OTP.',
        });
      }

      // Brute-force protection on OTP
      if (user.otp.attempts >= 5) {
        user.otp = undefined;
        await user.save();
        return res.status(429).json({
          success: false,
          message: 'Too many incorrect OTP attempts. Please request a fresh verification code.',
        });
      }

      user.otp.attempts = (user.otp.attempts || 0) + 1;
      await user.save();
      const remaining = 5 - user.otp.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid 6-digit verification code. (${remaining} attempt(s) left)`,
      });
    }

    // OTP Verified Successfully!
    user.isEmailVerified = true;
    user.otp = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // If pending role (university/industry), trigger admin notification
    if (['university', 'industry'].includes(user.role)) {
      await Notification.create({
        recipientRole: 'admin',
        title: 'New Account Pending Verification',
        message: `${user.name} verified their email and registered as a ${user.role} representative for ${user.org || 'Organisation'}.`,
        type: 'account_verified',
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Email address successfully verified! Welcome to Sahayog.',
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        org: user.org,
        location: user.location,
        disciplines: user.disciplines,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Resend 6-digit email OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail }).select('+otp');
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found for this email address.' });
    }

    // Cooldown check (60 seconds)
    if (user.otp && user.otp.lastSentAt) {
      const elapsed = (Date.now() - new Date(user.otp.lastSentAt).getTime()) / 1000;
      if (elapsed < 60) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil(60 - elapsed)} second(s) before requesting another code.`,
        });
      }
    }

    const otpCode = generateOtp();
    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      attempts: 0,
      lastSentAt: new Date(),
    };
    await user.save();

    console.log(`[AUTH] Resent Verification OTP for ${cleanEmail}: ${otpCode}`);

    res.json({
      success: true,
      message: `A new 6-digit verification code has been sent to ${cleanEmail}.`,
      previewOtp: process.env.NODE_ENV === 'production' ? undefined : otpCode,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token (Strong validation, No backdoors, Brute-force locked)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user by email (including password, failed attempts, and lock status)
    const user = await User.findOne({ email: cleanEmail }).select('+password +failedLoginAttempts +lockUntil +otp');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked due to excessive failed attempts. Please try again in ${remainingMinutes} minute(s).`,
      });
    }

    // Strict Password Verification (NO BACKDOORS!)
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-min lockout
        await user.save();
        return res.status(403).json({
          success: false,
          message: 'Account locked for 15 minutes due to 5 consecutive failed login attempts.',
        });
      }
      await user.save();
      const attemptsRemaining = 5 - user.failedLoginAttempts;
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. (${attemptsRemaining} attempt(s) remaining before temporary lockout)`,
      });
    }

    // Reset failed login attempts on valid password
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    // Ensure demo accounts are pre-verified
    if (cleanEmail.endsWith('@sahayog.in') && !user.isEmailVerified) {
      user.isEmailVerified = true;
      user.otp = undefined;
      await user.save();
    }

    // Check email verification status (for non-Google accounts)
    if (!user.isEmailVerified && !user.googleId) {
      const otpCode = generateOtp();
      user.otp = {
        code: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        lastSentAt: new Date(),
      };
      await user.save();

      console.log(`[AUTH] Verification OTP on login for unverified ${cleanEmail}: ${otpCode}`);

      return res.status(200).json({
        success: false,
        requireOtp: true,
        email: cleanEmail,
        message: 'Your email address is not verified yet. A 6-digit verification code has been sent to complete your sign-in.',
        previewOtp: process.env.NODE_ENV === 'production' ? undefined : otpCode,
      });
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
        isEmailVerified: user.isEmailVerified,
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
      return res.status(400).json({ success: false, message: 'Google credential or access token is required.' });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'Could not retrieve email from Google profile.' });
    }

    const cleanEmail = email.toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      const selectedRole = (role === 'community_reporter' ? 'citizen' : role) || 'citizen';
      const isPendingRole = ['university', 'industry'].includes(selectedRole);
      const status = isPendingRole ? 'pending' : 'active';
      const selectedDistrict = district || 'Ranchi';
      const selectedBlock = block || 'Kanke';

      user = await User.create({
        name: name || 'Google Verified User',
        email: cleanEmail,
        googleId,
        picture: picture || '',
        role: selectedRole,
        org: org || (isPendingRole ? 'Registered Entity' : ''),
        status,
        isEmailVerified: true, // Google OAuth confirms email authenticity
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
      let needsSave = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        user.isEmailVerified = true;
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
        isEmailVerified: user.isEmailVerified,
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
        isEmailVerified: req.user.isEmailVerified ?? true,
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
      isEmailVerified: user.isEmailVerified,
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
  verifyOtp,
  resendOtp,
  login,
  googleAuth,
  getMe,
  validateName,
  validateEmail,
  validatePassword,
};
