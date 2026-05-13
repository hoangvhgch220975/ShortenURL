const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/userModel');

// Validate token middleware
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 1) Check if token exists
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received for validation:', token);
    } else {
      console.log('No token found in authorization header');
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to get access.'
      });
    }
    
    // 2) Verify token
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      console.log('Token verified successfully, decoded payload:', decoded);
      
      // 3) Check if user still exists
      const user = await User.findUserById(decoded.id);
      
      if (!user) {
        console.log('User not found:', decoded.id);
        return res.status(401).json({
          status: 'error',
          message: 'The user belonging to this token no longer exists.'
        });
      }
      
      console.log('User found:', user);
      
      // 4) Set user in request
      req.user = user;
      next();
    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError.message);
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

// Validate token endpoint
exports.validate = async (req, res) => {
  try {
    // Ensure consistent casing for JSON response
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