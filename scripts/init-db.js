const mysql = require('mysql2/promise');
const config = require('../config');

async function initializeDatabase() {
  let connection;
  try {
    // First connect without specifying a database
    connection = await mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.db.database}`);
    console.log(`Database '${config.db.database}' created or already exists`);

    // Use the database
    await connection.query(`USE ${config.db.database}`);
    console.log(`Using database '${config.db.database}'`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        resetToken VARCHAR(255),
        resetTokenExpiry DATETIME,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created or already exists');

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

initializeDatabase().catch(console.error); 