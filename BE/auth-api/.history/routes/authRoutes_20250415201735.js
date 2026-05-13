const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Authentication routes
router.post('/login', authController.login);
router.get('/validate', authController.protect, authController.validate);
router.get('/me', authController.protect, authController.getMe);

module.exports = router;