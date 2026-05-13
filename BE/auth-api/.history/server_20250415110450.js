const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const config = require('./config/config');
const User = require('./models/userModel');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection
(async () => {
  try {
    await User.initializeDatabase();
    console.log('Database initialized.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
})();

// Routes
app.use('/api/auth', authRoutes);

// Validate token endpoint
app.use('/api/auth/validate', authMiddleware.protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});