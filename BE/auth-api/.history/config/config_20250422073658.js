module.exports = {
  PORT: process.env.PORT || 3000,

  // Access token settings
  JWT_SECRET: process.env.JWT_SECRET || 'duong@123',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '120m',

  // Refresh token settings
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-here',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  DB_CONFIG: {
    driver: 'msnodesqlv8',
    connectionString:
      'Driver={ODBC Driver 17 for SQL Server};' +
      'Server=localhost\\SQLEXPRESS02;' +
      'Database=TinyURLDB;' +
      'Trusted_Connection=yes;'
  }
};