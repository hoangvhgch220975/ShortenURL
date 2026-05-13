const sql = require('mssql/msnodesqlv8');
const config = require('../config/config');
const { customAlphabet } = require('nanoid');

// Tạo hàm sinh URL ngắn
const generateShortUrl = () => {
  const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6);
  return nanoid();
};

// Kiểm tra kết nối database
const initializeDatabase = async () => {
  try {
    const pool = await sql.connect(config.DB_CONFIG);
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
      .query('SELECT DISTINCT UserId AS Id, Email FROM InfURL WHERE Email = @email');
    
    if (result.recordset.length > 0) {
      return {
        Id: result.recordset[0].Id,
        Email: result.recordset[0].Email
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user:', error);
    throw error;
  }
};

// Tạo thông tin user mới và lưu vào database
const createUser = async (email, user_id, defaultUrl) => {
  try {
    const pool = await sql.connect(config.DB_CONFIG);
    
    // Sinh URL ngắn
    const shortUrl = generateShortUrl();
    
    // Thêm user mới và URL mặc định vào database
    const result = await pool.request()
      .input('userId', sql.NVarChar, user_id)
      .input('email', sql.NVarChar, email)
      .input('defaultUrl', sql.NVarChar, defaultUrl)
      .input('shortUrl', sql.NVarChar, shortUrl)
      .query(`
        INSERT INTO InfURL (
          UserId, 
          Email, 
          DefaultUrl, 
          NewUrl, 
          IsCustomized, 
          CreatedAt, 
          IsActive, 
          ClickCount
        ) VALUES (
          @userId, 
          @email, 
          @defaultUrl, 
          @shortUrl, 
          0, 
          GETDATE(), 
          1, 
          0
        );
        
        SELECT @userId AS Id, @email AS Email, @shortUrl AS ShortUrl
      `);
    
    console.log('New user and default URL created:', {
      Id: user_id,
      Email: email,
      ShortUrl: shortUrl
    });
    
    return {
      Id: user_id,
      Email: email,
      ShortUrl: shortUrl
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Tìm user theo ID
const findUserById = async (userId) => {
  try {
    const pool = await sql.connect(config.DB_CONFIG);
    const result = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .query(`
        SELECT TOP 1 
          UserId AS Id, 
          Email 
        FROM InfURL 
        WHERE UserId = @userId
      `);
    
    if (result.recordset.length > 0) {
      return {
        Id: result.recordset[0].Id,
        Email: result.recordset[0].Email
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
};

module.exports = {
  initializeDatabase,
  findUserByEmail,
  createUser,
  findUserById      
};