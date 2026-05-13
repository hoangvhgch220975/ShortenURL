const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Login + refresh + logout + getMe + validate + check-token
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.protect, authController.logout);
router.get('/me',     authController.protect, authController.getMe);
router.get('/validate', authController.protect, authController.validate);
router.get('/check-token', authController.protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Token is valid',
    user: { id: req.user.Id, email: req.user.Email }
  });
});

module.exports = router;
