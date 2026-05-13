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
const findUserById = async (userId) => {
  try {
    // Replace this with your actual database query
    // For example, if you're using MongoDB:
    // return await User.findOne({ _id: userId });
    
    // If you're using a simple database or in-memory store:
    const user = users.find(u => u.Id === userId);
    return user || null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
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

module.exports = {
  initializeDatabase,
  findUserByEmail,
  createUser,
  findUserById      
};