// test-db-connection.js
const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'YourStrong!Passw0rd',
  server: 'sqlserver',
  database: 'TinyURLDB',
  options: {
    trustServerCertificate: true,
    encrypt: false
  }
};

async function testConnection() {
  try {
    console.log('Attempting to connect to SQL Server...');
    await sql.connect(config);
    console.log('Connected to SQL Server successfully!');
    
    // Run a simple query
    const result = await sql.query`SELECT GETDATE() AS CurrentTime`;
    console.log('Query result:', result.recordset[0]);
    
    await sql.close();
    console.log('Connection closed');
  } catch (err) {
    console.error('Error connecting to SQL Server:', err);
  }
}

testConnection();