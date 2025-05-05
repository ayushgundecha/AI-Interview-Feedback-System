import mysql from 'mysql2/promise';
import logger from './logger';

const getDbConnection = async () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'interview_prep',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  };

  try {
    // First connect without specifying a database
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
    await connection.query(`USE ${config.database}`);

    // Create users table if it doesn't exist
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

    await connection.end();

    // Now create the pool with the database
    return mysql.createPool(config);
  } catch (error) {
    logger.error('Failed to create database connection', {
      error: error instanceof Error ? error.message : 'Unknown error',
      config: { ...config, password: '***' }
    });
    throw error;
  }
};

// Initialize the pool
const pool = getDbConnection().catch(error => {
  logger.error('Failed to initialize database pool:', error);
  process.exit(1);
});

export { pool }; 