// server.js
const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const User = require('./models/userModel');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware chung
app.use(cors());
app.use(express.json());

// Khởi tạo kết nối database trước khi bắt đầu phục vụ request
(async () => {
  try {
    await User.initializeDatabase();
    console.log('✅ Database initialized.');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Không nên thoát app!
    // process.exit(1);
  }
})();



// Mount các route của service Authentication
// - POST  /api/auth/login
// - POST  /api/auth/refresh-token
// - GET   /api/auth/check-token
// - GET   /api/auth/validate
// - GET   /api/auth/me
// - POST  /api/auth/logout
app.use('/api/auth', authRoutes);

// Bắt đầu lắng nghe
app.listen(config.PORT, () => {
  console.log(`🚀 Auth service running on port ${config.PORT}`);
});
