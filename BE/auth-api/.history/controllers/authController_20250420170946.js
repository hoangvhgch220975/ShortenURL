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
      return res.status(400).json({ status: 'error', message: 'Email không hợp lệ' });
    }

    let user = await User.findUserByEmail(email);
    if (!user) {
      // Lưu ý: nếu bạn không dùng defaultUrl, hãy bỏ tham số này trong createUser
      user = await User.createUser(email, uid);
    }

    const accessToken = generateAccessToken(user.Id, user.Email);
    const refreshToken = generateRefreshToken(user.Id, user.Email);

    // TODO: nếu muốn bảo mật hơn, lưu refreshToken vào DB để quản lý (revoke, blacklist)
    res.status(200).json({
      status: 'success',
      data: {
        userId: user.Id,
        email: user.Email,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi đăng nhập' });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ status: 'error', message: 'Refresh token không tồn tại' });
    }

    // Kiểm tra chữ ký và payload
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ status: 'error', message: 'Refresh token không hợp lệ' });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ status: 'error', message: 'Token không phải là refresh token' });
    }

    const user = await User.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Người dùng không tồn tại' });
    }

    const newAccessToken = generateAccessToken(user.Id, user.Email);
    res.status(200).json({
      status: 'success',
      data: { accessToken: newAccessToken }
    });
  } catch (error) {
    console.error('Lỗi refresh token:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
  }
};

// Lấy thông tin user hiện tại
exports.getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: { id: req.user.Id, email: req.user.Email } }
  });
};

// Logout (nếu dùng blacklist refresh token thì xử lý revoke ở đây)
exports.logout = async (req, res) => {
  // Ví dụ: nếu gửi lên refreshToken thì có thể xóa nó khỏi DB
  res.status(200).json({ status: 'success', message: 'Đã đăng xuất thành công' });
};
