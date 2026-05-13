const express = require('express');
const authController = require('./controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login',          authController.login);
router.post('/refresh-token',  authController.refreshToken);

// Tất cả các route sau đều cần token
router.use(protect);

router.get ('/check-token',    (req, res) => {
  res.json({ status: 'success', message: 'Token hợp lệ', user: { id: req.user.Id, email: req.user.Email } });
});
router.get ('/validate',       authController.validate);
router.get ('/me',             authController.getMe);
router.post('/logout',         authController.logout);

module.exports = router;
