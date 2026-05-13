const sql = require('mssql/msnodesqlv8');
const config = require('../config/config');

// Initialize DB connection
async function initializeDatabase() {
  const pool = await sql.connect(config.DB_CONFIG);
  await pool.request().query('SELECT 1');
}

// Find user by email
async function findUserByEmail(email) {
  const pool = await sql.connect(config.DB_CONFIG);
  const result = await pool.request()
    .input('email', sql.NVarChar, email)
    .query('SELECT TOP 1 UserId AS Id, Email FROM InfURL WHERE Email = @email');
  if (result.recordset.length) {
    return { Id: result.recordset[0].Id, Email: result.recordset[0].Email };
  }
  return null;
}

// Create new user
async function createUser(email, userId) {
  const pool = await sql.connect(config.DB_CONFIG);
  const defaultUrl = '';
  const shortUrl = Math.random().toString(36).substring(2, 8);
  await pool.request()
    .input('userId', sql.NVarChar, userId)
    .input('email', sql.NVarChar, email)
    .input('defaultUrl', sql.NVarChar, defaultUrl)
    .input('shortUrl', sql.NVarChar, shortUrl)
    .query(`
      INSERT INTO InfURL
      (UserId, Email, DefaultUrl, NewUrl, IsCustomized, CreatedAt, IsActive, ClickCount)
      VALUES
      (@userId, @email, @defaultUrl, @shortUrl, 0, GETDATE(), 1, 0)
    `);
  return { Id: userId, Email: email };
}

// Find user by ID
async function findUserById(userId) {
  const pool = await sql.connect(config.DB_CONFIG);
  const result = await pool.request()
    .input('userId', sql.NVarChar, userId)
    .query('SELECT TOP 1 UserId AS Id, Email FROM InfURL WHERE UserId = @userId');
  if (result.recordset.length) {
    return { Id: result.recordset[0].Id, Email: result.recordset[0].Email };
  }
  return null;
}

module.exports = {
  initializeDatabase,
  findUserByEmail,
  createUser,
  findUserById
};