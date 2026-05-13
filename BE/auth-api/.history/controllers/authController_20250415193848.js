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

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 1) Check if token exists
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to get access.'
      });
    }
    
    // 2) Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // 3) Check if user still exists
    const user = await User.findUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.'
      });
    }
    
    // 4) Set user in request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token or token expired.'
    });
  }
};

// Login handler
exports.login = async (req, res) => {
  try {
    const { uid, email } = req.body;
    
    // Validate email
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email'
      });
    }
    
    // Check if user exists
    let user = await User.findUserByEmail(email);
    
    // If user doesn't exist, create a new user
    if (!user) {
      user = await User.createUser(email, uid);
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
      message: 'An error occurred during login'
    });
  }
};

// Validate token
exports.validate = async (req, res) => {
  try {
    // The protect middleware has already verified the token
    // and added the user to the request
    console.log('Validating token for user:', req.user);
    
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
    console.error('Token validation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during token validation'
    });
  }
};

// Get current user info
exports.getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};