const { verifyAccessToken } = require('../utils/jwtHelper');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return ApiResponse.unauthorized(res, 'No token provided. Please log in.');

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!user) return ApiResponse.unauthorized(res, 'User no longer exists.');
    if (!user.isActive) return ApiResponse.unauthorized(res, 'Account deactivated.');
    if (user.changedPasswordAfter(decoded.iat)) {
      return ApiResponse.unauthorized(res, 'Password changed. Please log in again.');
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return ApiResponse.unauthorized(res, 'Invalid token.');
    if (error.name === 'TokenExpiredError') return ApiResponse.unauthorized(res, 'Token expired.');
    logger.error('Auth middleware error:', error);
    return ApiResponse.error(res, 'Authentication error');
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return ApiResponse.forbidden(res, `Access denied. Required: ${roles.join(' or ')}`);
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    }
  } catch (_) {}
  next();
};

module.exports = { protect, restrictTo, optionalAuth };
