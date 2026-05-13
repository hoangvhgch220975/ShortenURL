const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Thêm route check-token
router.get('/check-token', authController.protect, authController.checkTokenValidity);

// Các route khác giữ nguyên
router.post('/login', authController.login);
router.get('/validate', authController.protect, authController.validate);
router.get('/me', authController.protect, authController.getMe);
router.post('/logout', authController.protect, authController.logout);

module.exports = router;