const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/userModel');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Chưa đăng nhập' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User not exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ status: 'error', message: 'Token không hợp lệ hoặc hết hạn' });
  }
};