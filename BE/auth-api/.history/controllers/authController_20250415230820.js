const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/userModel');
const config = require('../config/config');

// Danh sách token đã bị invalidate
const invalidatedTokens = new Set();

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { 
      id: userId, 
      email, 
      iat: Date.now() 
    },
    config.JWT_SECRET,
    { 
      expiresIn: config.JWT_EXPIRES_IN 
    }
  );
};

// Middleware kiểm tra token hợp lệ
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Kiểm tra token trong header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      
      // Kiểm tra token đã bị invalidate chưa
      if (invalidatedTokens.has(token)) {
        return res.status(401).json({
          status: 'error',
          message: 'Token đã bị hủy. Vui lòng đăng nhập lại.'
        });
      }
      
      // Xác thực token
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        
        // Kiểm tra user tồn tại
        const user = await User.findUserById(decoded.id);
        
        if (!user) {
          return res.status(401).json({
            status: 'error',
            message: 'Người dùng không tồn tại'
          });
        }
        
        req.user = user;
        req.token = token;
        next();
      } catch (jwtError) {
        // Xử lý lỗi token hết hạn
        if (jwtError.name === 'TokenExpiredError') {
          return res.status(401).json({
            status: 'error',
            message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
          });
        }
        
        return res.status(401).json({
          status: 'error',
          message: 'Token không hợp lệ'
        });
      }
    } else {
      return res.status(401).json({
        status: 'error',
        message: 'Vui lòng đăng nhập'
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Lỗi máy chủ'
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // Thêm token vào danh sách bị invalidate
    if (req.token) {
      invalidatedTokens.add(req.token);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi đăng xuất'
    });
  }
};

// Kiểm tra token còn hiệu lực
exports.checkTokenValidity = async (req, res) => {
  try {
    // Middleware protect đã kiểm tra token
    res.status(200).json({
      status: 'success',
      message: 'Token hợp lệ',
      user: {
        id: req.user.Id,
        email: req.user.Email
      }
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Token không hợp lệ'
    });
  }
};

// Các phương thức khác giữ nguyên...