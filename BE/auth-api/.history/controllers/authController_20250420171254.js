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

const generateAccessToken = (userId, email) =>
  jwt.sign({ id: userId, email, type: 'access' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });

const generateRefreshToken = (userId, email) =>
  jwt.sign({ id: userId, email, type: 'refresh' }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN
  });

exports.login = async (req, res) => {
  try {
    const { uid, email } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ status: 'error', message: 'Email không hợp lệ' });
    }
    let user = await User.findUserByEmail(email);
    if (!user) user = await User.createUser(email, uid);
    const accessToken  = generateAccessToken(user.Id, user.Email);
    const refreshToken = generateRefreshToken(user.Id, user.Email);
    // (tuỳ chọn) lưu refreshToken vào DB tại đây
    res.json({ status: 'success', data: { userId: user.Id, email: user.Email, accessToken, refreshToken } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ status: 'error', message: 'Không có refresh token' });
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ status: 'error', message: 'Refresh token không hợp lệ' });
    }
    if (decoded.type !== 'refresh')
      return res.status(401).json({ status: 'error', message: 'Token không phải loại refresh' });
    const user = await User.findUserById(decoded.id);
    if (!user)
      return res.status(401).json({ status: 'error', message: 'Người dùng không tồn tại' });
    const newAccessToken = generateAccessToken(user.Id, user.Email);
    res.json({ status: 'success', data: { accessToken: newAccessToken } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
  }
};

exports.validate = async (req, res) => {
  // req.user được gán bởi middleware.protect
  res.json({
    status: 'success',
    data: { user: { id: req.user.Id, email: req.user.Email } }
  });
};

exports.getMe = async (req, res) => {
  res.json({
    status: 'success',
    data: { user: { id: req.user.Id, email: req.user.Email } }
  });
};

exports.logout = async (req, res) => {
  // (tuỳ chọn) revoke refresh token ở đây nếu có lưu
  res.json({ status: 'success', message: 'Đã logout' });
};
