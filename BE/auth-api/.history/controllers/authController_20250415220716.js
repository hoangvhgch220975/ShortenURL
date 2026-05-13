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
    console.log('--- Protect middleware called ---');
    console.log('Request headers:', req.headers);
    
    let token;
    
    // Check if token exists
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted from headers:', token.substring(0, 15) + '...');
    } else {
      console.log('No Bearer token found in Authorization header');
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to get access.'
      });
    }
    
    // Verify token
    try {
      console.log('Verifying token with JWT_SECRET');
      const decoded = jwt.verify(token, config.JWT_SECRET);
      console.log('Token verified successfully. Decoded payload:', decoded);
      
      // Check if user still exists
      console.log('Looking up user with ID:', decoded.id);
      const user = await User.findUserById(decoded.id);
      
      if (!user) {
        console.log('User not found in database:', decoded.id);
        return res.status(401).json({
          status: 'error',
          message: 'The user belonging to this token no longer exists.'
        });
      }
      
      console.log('User found:', user);
      
      // Set user in request
      req.user = user;
      next();
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token or token expired.'
      });
    }
  } catch (error) {
    console.error('Error in protect middleware:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication.'
    });
  }
};

// Login handler
exports.login = async (req, res) => {
  try {
    const { uid, email } = req.body;
    console.log('Login request received:', { uid, email });
    
    // Validate email
    if (!email || !validator.isEmail(email)) {
      console.log('Invalid email provided:', email);
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email'
      });
    }
    
    // Check if user exists
    let user = await User.findUserByEmail(email);
    
    // If user doesn't exist, create a new user
    if (!user) {
      console.log('User not found, creating new user with email:', email);
      user = await User.createUser(email, uid);
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