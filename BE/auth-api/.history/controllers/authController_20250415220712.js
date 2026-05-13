const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/userModel');
const config = require('../config/config');

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
};

// Login handler
exports.login = async (req, res) => {
  try {
    const { uid, email, defaultUrl } = req.body;
    console.log('Login request received:', { uid, email, defaultUrl });
    
    // Validate email
    if (!email || !validator.isEmail(email)) {
      console.log('Invalid email provided:', email);
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email'
      });
    }
    
    // Validate default URL if provided
    if (defaultUrl && !validator.isURL(defaultUrl)) {
      console.log('Invalid default URL:', defaultUrl);
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid URL'
      });
    }
    
    // Check if user exists
    let user = await User.findUserByEmail(email);
    
    // If user doesn't exist, create a new user with default URL
    if (!user) {
      console.log('User not found, creating new user');
      user = await User.createUser(
        email, 
        uid, 
        defaultUrl || 'https://default-website.com'
      );
      console.log('New user created:', user);
    } else {
      console.log('Existing user found:', user);
    }
    
    // Generate token
    const token = generateToken(user.Id, user.Email);
    console.log('JWT token generated for user ID:', user.Id);
    
    res.status(200).json({
      status: 'success',
      data: {
        userId: user.Id,
        email: user.Email,
        shortUrl: user.ShortUrl || null,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during login'
    });
  }
};

// Các phần còn lại của mã giữ nguyên như cũ
exports.protect = async (req, res, next) => { /* ... */ };
exports.validate = async (req, res) => { /* ... */ };
exports.getMe = async (req, res) => { /* ... */ };