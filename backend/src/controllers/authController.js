const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwtHelper');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return ApiResponse.conflict(res, 'Email already registered');

    const user = await User.create({ name, email, password });
    const tokens = generateTokenPair(user);

    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    logger.info(`New user registered: ${email}`);
    return ApiResponse.created(res, { ...tokens, user }, 'Registration successful');
  } catch (err) {
    logger.error('Register error:', err);
    return ApiResponse.error(res, err.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return ApiResponse.unauthorized(res, 'Invalid email or password');
    }
    if (!user.isActive) return ApiResponse.unauthorized(res, 'Account deactivated');

    const tokens = generateTokenPair(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    logger.info(`User logged in: ${email}`);
    return ApiResponse.success(res, { ...tokens, user }, 'Login successful');
  } catch (err) {
    logger.error('Login error:', err);
    return ApiResponse.error(res, err.message);
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: rToken } = req.body;
    if (!rToken) return ApiResponse.badRequest(res, 'Refresh token required');

    const decoded = verifyRefreshToken(rToken);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== rToken) {
      return ApiResponse.unauthorized(res, 'Invalid refresh token');
    }

    const tokens = generateTokenPair(user);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    return ApiResponse.success(res, tokens, 'Token refreshed');
  } catch (err) {
    return ApiResponse.unauthorized(res, 'Invalid or expired refresh token');
  }
};

const logout = async (req, res) => {
  try {
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
    return ApiResponse.success(res, {}, 'Logged out successfully');
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

const getMe = async (req, res) => {
  return ApiResponse.success(res, { user: req.user }, 'Profile fetched');
};

const updateMe = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    );
    return ApiResponse.success(res, { user }, 'Profile updated');
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return ApiResponse.unauthorized(res, 'Current password is incorrect');
    }
    user.password = newPassword;
    await user.save();
    const tokens = generateTokenPair(user);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });
    return ApiResponse.success(res, tokens, 'Password changed successfully');
  } catch (err) {
    return ApiResponse.error(res, err.message);
  }
};

module.exports = { register, login, refreshToken, logout, getMe, updateMe, changePassword };
