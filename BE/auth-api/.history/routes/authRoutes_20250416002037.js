const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Ensure this route is added
router.get('/check-token', authController.protect, (req, res) => {
  // If the request reaches here, the token is valid
  res.status(200).json({
    status: 'success',
    message: 'Token is valid',
    user: {
      id: req.user.Id,
      email: req.user.Email
    }
  });
});

// Other existing routes remain the same
router.post('/login', authController.login);
router.get('/validate', authController.protect, authController.validate);
router.get('/me', authController.protect, authController.getMe);
router.post('/logout', authController.protect, authController.logout);

module.exports = router;