const sql = require('mssql/msnodesqlv8');
const config = require('../config/config');


// Kiểm tra kết nối database
const initializeDatabase = async () => {
  try {
    const pool = await sql.connect(config.DB_CONFIG);
    // Kiểm tra kết nối đến database
    const result = await pool.request().query('SELECT 1');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};


// Tìm user theo email từ bảng InfURL
const findUserByEmail = async (email) => {
  try {
    const pool = await sql.connect(config.DB_CONFIG);
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT DISTINCT Email, UserId FROM InfURL WHERE Email = @email');
    
    if (result.recordset.length > 0) {
      return {
        Id: result.recordset[0].UserId,
        Email: result.recordset[0].Email
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  }
};

// Tạo thông tin user mới (không lưu vào database)
const createUser = async (email, user_id) => {
  try {
    // Tạo một userId duy nhất
    // const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    return {
      Id: user_id,
      Email: email
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
const findUserById = async (userId) => {
  try {
    const pool = await sql.connect(config.DB_CONFIG);
    
    // Debug: Log all parameters and perform a more flexible search
    console.log('Searching for user with ID:', userId);
    
    // First, try exact match
    let result = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .query(`
        SELECT TOP 1 
          UserId AS Id, 
          Email 
        FROM InfURL 
        WHERE UserId = @userId
      `);
    
    // If no exact match, try case-insensitive search
    if (result.recordset.length === 0) {
      console.log('No exact match found, trying case-insensitive search');
      result = await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query(`
          SELECT TOP 1 
            UserId AS Id, 
            Email 
          FROM InfURL 
          WHERE LOWER(UserId) = LOWER(@userId)
        `);
    }
    
    // If still no match, log all existing user IDs for debugging
    if (result.recordset.length === 0) {
      const allUsers = await pool.request()
        .query('SELECT DISTINCT UserId, Email FROM InfURL');
      
      console.log('No user found. Existing users:', allUsers.recordset);
      return null;
    }
    
    // Log and return found user
    const user = {
      Id: result.recordset[0].Id,
      Email: result.recordset[0].Email
    };
    
    console.log('User found:', user);
    return user;
  } catch (error) {
    console.error('Detailed error finding user by ID:', {
      message: error.message,
      stack: error.stack,
      userId: userId
    });
    return null;
  }
};

module.exports = {
  initializeDatabase,
  findUserByEmail,
  createUser,
  findUserById      
};
