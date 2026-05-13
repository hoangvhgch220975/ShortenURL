const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/userModel');
const config = require('../config/config');

const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
};

exports.login = async (req, res) => {
  try {
    const { uid, email  } = req.body;

    // Validate email
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng cung cấp email hợp lệ'
      });
    }
    // console.log(`Received login request with email: ${email}`);

    // Check if user exists
    let user = await User.findUserByEmail(email);
    
    // If user doesn't exist, create a temporary user object
    if (!user) {
      user = await User.createUser(email, uid);
      // console.log(`User not found, creating temporary user with ID: ${user.Id}`);
      // console.log(`Created temporary user with email: ${email}`);
    }

    // Generate token
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
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Đã xảy ra lỗi khi đăng nhập'
    });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};