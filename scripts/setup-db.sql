-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS interview_prep;

-- Use the database
USE interview_prep;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  resetToken VARCHAR(255),
  resetTokenExpiry DATETIME,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 