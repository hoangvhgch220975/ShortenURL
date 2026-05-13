const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.use(protect);
router.get('/check-token', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Valid Token', user: { id: req.user.Id, email: req.user.Email } });
});
router.get('/validate', authController.validate);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;