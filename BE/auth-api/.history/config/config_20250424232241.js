module.exports = {
  PORT: process.env.PORT || 3000,
  // Access token settings
  JWT_SECRET: process.env.JWT_SECRET || 'duong@123456',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '120m',
  // Refresh token settings
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'duong@123456',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  DB_CONFIG: {
    user: process.env.DB_CONFIG_USER || 'sa',
    password: process.env.DB_CONFIG_PASSWORD || 'YourStrong!Passw0rd',
    server: process.env.DB_CONFIG_SERVER || 'localhost',
    database: process.env.DB_CONFIG_DATABASE || 'TinyURLDB',
    options: {
      encrypt: process.env.DB_CONFIG_ENCRYPT === 'true',
      trustServerCertificate: true, // Force to true
      enableArithAbort: true
    }
  }
};