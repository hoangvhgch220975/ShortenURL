const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/userModel');
const config = require('../config/config');

// Danh sách token bị invalidate
const invalidatedTokens = new Set();

// Sinh token JWT
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

// Middleware bảo vệ route
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Kiểm tra Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      
      // Kiểm tra token đã bị invalidate chưa
      if (invalidatedTokens.has(token)) {
        return res.status(401).json({
          status: 'error',
          message: 'Token đã bị hủy. Vui lòng đăng nhập lại.'
        });
      }
      
      try {
        // Xác thực token
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
        // Xử lý lỗi token
        if (jwtError.name === 'TokenExpiredError') {
          return res.status(401).json({
            status: 'error',
            message: 'Phiên đăng nhập đã hết hạn'
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
    
    // Tạo token
    const token = generateToken(user.Id, user.Email);
    
    res.status(200).json({
      status: 'success',
      data: {
        userId: user.Id,
        email: user.Email,
        token
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

// Invalidated tokens set
// const invalidatedTokens = new Set();

// Logout method
exports.logout = async (req, res) => {
  try {
    // Log the user making the logout request
    console.log('Logout request received for user:', req.user);
    
    // Optional: Add token to invalidated tokens list
    if (req.token) {
      invalidatedTokens.add(req.token);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Logout failed'
    });
  }
};


// Kiểm tra token
exports.validate = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: req.user.Id,
          email: req.user.Email
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi xác thực'
    });
  }
};