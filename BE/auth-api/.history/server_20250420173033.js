// routes/authRoutes.js
const express = require('express');
const { login, refreshToken, validate, getMe, logout } = require('./controllers/authController');
const { protect } = require('.s');

const router = express.Router();

// Public
router.post('/login',         login);
router.post('/refresh-token', refreshToken);

// Tất cả routes sau cần phải đăng nhập
router.use(protect);

router.get ('/check-token',   (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Token hợp lệ',
    user: { id: req.user.Id, email: req.user.Email }
  });
});
router.get ('/validate',      validate);
router.get ('/me',            getMe);
router.post('/logout',        logout);

module.exports = router;
