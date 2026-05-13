// config.js
module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB_CONFIG: {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=VH24\\SQLEXPRESS02;Database=TinyURLDB;Trusted_Connection=yes;'
  }
};