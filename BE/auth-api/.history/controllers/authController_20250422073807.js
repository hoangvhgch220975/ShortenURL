const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/userModel');
const config = require('../config/config');

const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN
} = config;

// Sinh access token
const generateAccessToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Sinh refresh token
const generateRefreshToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { uid, email } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ status: 'error', message: 'Invalid email' });
    }

    let user = await User.findUserByEmail(email);
    if (!user) {
      user = await User.createUser(email, uid);
    }

    const accessToken = generateAccessToken(user.Id, user.Email);
    const refreshToken = generateRefreshToken(user.Id, user.Email);

    res.status(200).json({
      status: 'success',
      data: { userId: user.Id, email: user.Email, accessToken, refreshToken }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ status: 'error', message: 'Error Server' });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ status: 'error', message: 'Not have refresh token' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ status: 'error', message: 'Refresh token không hợp lệ' });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ status: 'error', message: 'Token is not refresh type' });
    }

    const user = await User.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User not exist' });
    }

    const newAccessToken = generateAccessToken(user.Id, user.Email);
    res.status(200).json({ status: 'success', data: { accessToken: newAccessToken } });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
  }
};

// Validate token
exports.validate = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: { id: req.user.Id, email: req.user.Email } }
  });
};

// Get current user
exports.getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: { id: req.user.Id, email: req.user.Email } }
  });
};

// Logout
exports.logout = async (req, res) => {
  res.status(200).json({ status: 'success', message: 'Đã logout' });
};