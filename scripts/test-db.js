const mysql = require('mysql2/promise');
const config = require('../config');

// Debug environment variables
console.log('Current working directory:', process.cwd());
console.log('Environment file path:', config.env.path);
console.log('\nEnvironment variables:');
console.log('DB_HOST:', config.db.host);
console.log('DB_USER:', config.db.user);
console.log('DB_PASSWORD:', config.db.password ? '*** (set)' : '*** (not set)');
console.log('DB_NAME:', config.db.database);

// Make sure we have the required environment variables
if (!config.db.password) {
  console.error('\n❌ Error: DB_PASSWORD is not set in config file');
  console.log('Please make sure your config file contains:');
  console.log('DB_HOST=localhost');
  console.log('DB_USER=root');
  console.log('DB_PASSWORD=root');
  console.log('DB_NAME=interview_prep');
  console.log('\nCurrent config file contents:');
  try {
    const fs = require('fs');
    const envPath = config.env.path;
    if (fs.existsSync(envPath)) {
      console.log(fs.readFileSync(envPath, 'utf8'));
    } else {
      console.log('config file does not exist at:', envPath);
    }
  } catch (err) {
    console.error('Error reading config file:', err);
  }
  process.exit(1);
}

async function testConnection() {
  let connection;
  try {
    console.log('\nCurrent working directory:', process.cwd());
    console.log('Environment file path:', config.env.path);
    console.log('\nEnvironment variables:');
    console.log('DB_HOST:', config.db.host);
    console.log('DB_USER:', config.db.user);
    console.log('DB_PASSWORD:', config.db.password ? '*** (set)' : '*** (not set)');
    console.log('DB_NAME:', config.db.database);

    console.log('\nTesting database connection with these settings:');
    console.log('Host:', config.db.host);
    console.log('User:', config.db.user);
    console.log('Database:', config.db.database);
    console.log('Password:', config.db.password ? '*** (set)' : '*** (not set)');

    // First try to connect without specifying a database
    connection = await mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password
    });

    console.log('\nSuccessfully connected to MySQL server!');

    // Check if database exists
    const [rows] = await connection.query('SHOW DATABASES LIKE ?', [config.db.database]);
    if (rows.length === 0) {
      console.log(`\nDatabase '${config.db.database}' does not exist. Creating it...`);
      await connection.query(`CREATE DATABASE ${config.db.database}`);
      console.log(`Database '${config.db.database}' created successfully!`);
    }

    // Now connect to the specific database
    await connection.end();
    connection = await mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database
    });

    console.log(`\nSuccessfully connected to database '${config.db.database}'!`);

    // Check if users table exists
    const [tables] = await connection.query('SHOW TABLES LIKE ?', ['users']);
    if (tables.length === 0) {
      console.log('\nUsers table does not exist. Creating it...');
      await connection.query(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Users table created successfully!');
    }

    console.log('\nDatabase setup is complete and working correctly!');
  } catch (error) {
    console.error('\nError:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Please check your username and password.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Please check if MySQL server is running.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist. Please create it first.');
    } else {
      console.error('An unexpected error occurred:', error);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection(); 