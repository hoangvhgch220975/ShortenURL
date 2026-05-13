const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
  try {
    // 1) Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.'
      });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findUserByEmail(decoded.email);
    
    // For users that don't exist in InfURL, we allow them through if the token is valid
    // This is because we're using InfURL as our user database, but new users won't be in there until they create a URL
    const tokenUser = {
      Id: decoded.id,
      Email: decoded.email
    };

    // 4) Grant access to protected route
    req.user = user || tokenUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token không hợp lệ. Vui lòng đăng nhập lại.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token đã hết hạn. Vui lòng đăng nhập lại.'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Đã xảy ra lỗi trong quá trình xác thực.'
    });
  }
};