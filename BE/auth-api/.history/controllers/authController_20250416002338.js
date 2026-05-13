const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/userModel');
const config = require('../config/config');

// Sinh access token
const generateAccessToken = (userId, email) => {
  return jwt.sign(
    { 
      id: userId, 
      email, 
      type: 'access' 
    },
    config.JWT_SECRET,
    { 
      expiresIn: '15m' // Thời gian ngắn hơn
    }
  );
};

// Sinh refresh token
const generateRefreshToken = (userId, email) => {
  return jwt.sign(
    { 
      id: userId, 
      email, 
      type: 'refresh' 
    },
    config.JWT_REFRESH_SECRET, // Sử dụng secret khác
    { 
      expiresIn: '7d' // Thời gian dài hơn
    }
  );
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { uid, email } = req.body;
    
    // Validate email
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Email không hợp lệ'
      });
    }
    
    // Kiểm tra hoặc tạo user
    let user = await User.findUserByEmail(email);
    
    if (!user) {
      user = await User.createUser(email, uid);
    }
    
    // Tạo access token và refresh token
    const accessToken = generateAccessToken(user.Id, user.Email);
    const refreshToken = generateRefreshToken(user.Id, user.Email);
    
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
    res.status(500).json({
      status: 'error',
      message: 'Lỗi đăng nhập'
    });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token không tồn tại'
      });
    }

    try {
      // Giải mã refresh token
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);

      // Kiểm tra loại token
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          status: 'error',
          message: 'Token không hợp lệ'
        });
      }

      // Tìm user
      const user = await User.findUserById(decoded.id);

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Người dùng không tồn tại'
        });
      }

      // Tạo access token mới
      const newAccessToken = generateAccessToken(user.Id, user.Email);

      res.status(200).json({
        status: 'success',
        data: {
          accessToken: newAccessToken
        }
      });
    } catch (jwtError) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token không hợp lệ'
      });
    }
  } catch (error) {
    console.error('Lỗi refresh token:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi máy chủ'
    });
  }
};