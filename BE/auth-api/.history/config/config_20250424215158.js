module.exports = {
  PORT: process.env.PORT || 3000,
  // Access token settings
  JWT_SECRET: process.env.JWT_SECRET || 'duong@123456',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '120m',
  // Refresh token settings
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'duong@123456',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  DB_CONFIG: {
    driver: process.env.DB_CONFIG_DRIVER || 'msnodesqlv8',
    server: process.env.DB_CONFIG_SERVER || 'localhost\\SQLEXPRESS02',
    database: process.env.DB_CONFIG_DATABASE || 'TinyURLDB',
    user: process.env.DB_CONFIG_USER,
    password: process.env.DB_CONFIG_PASSWORD,
    options: {
      encrypt: process.env.DB_CONFIG_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_CONFIG_TRUST_SERVER_CERTIFICATE === 'true'
    }
  }
};