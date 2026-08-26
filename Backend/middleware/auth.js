const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'sahayog_sih2026_jwt_secret_dev_key_2026';
    
    // Check if token is standard JWT or encoded demo token
    try {
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        return next();
      }
    } catch {
      // Fallback for btoa demo token
      try {
        const decodedFallback = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
        const user = await User.findById(decodedFallback.id) || await User.findOne({ email: decodedFallback.email });
        if (user) {
          req.user = user;
          return next();
        }
        // Fallback synthetic mock user object
        req.user = {
          _id: decodedFallback.id || 'u-demo',
          id: decodedFallback.id || 'u-demo',
          name: decodedFallback.name || 'Demo User',
          role: decodedFallback.role || 'community_reporter',
          org: decodedFallback.org || 'Sahayog Network',
          status: 'active',
        };
        return next();
      } catch {
        return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
      }
    }

    return res.status(401).json({ success: false, message: 'User not found for this token' });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route', error: err.message });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
