import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../../../lib/email';
import logger from '../../../lib/logger';

// Create a reusable database connection
const getDbConnection = () => {
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
    logger.error('Missing database environment variables', {
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME
    });
    throw new Error('Missing required database environment variables');
  }

  try {
    return mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  } catch (error) {
    logger.error('Failed to create database connection', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

// Rate limiting middleware
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 3;

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const userRequests = rateLimit.get(email);

  if (!userRequests) {
    rateLimit.set(email, { count: 1, timestamp: now });
    return false;
  }

  if (now - userRequests.timestamp > RATE_LIMIT_WINDOW) {
    rateLimit.set(email, { count: 1, timestamp: now });
    return false;
  }

  if (userRequests.count >= MAX_REQUESTS) {
    return true;
  }

  rateLimit.set(email, { count: userRequests.count + 1, timestamp: userRequests.timestamp });
  return false;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    logger.warn('Invalid method for forgot password endpoint', { method: req.method });
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let pool;
  try {
    pool = getDbConnection();
    logger.info('Database connection established');

    const { email } = req.body;

    if (!email) {
      logger.warn('Missing email in forgot password request');
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn('Invalid email format in forgot password request', { email });
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check rate limiting
    if (isRateLimited(email)) {
      logger.warn('Rate limit exceeded for forgot password request', { email });
      return res.status(429).json({ 
        message: 'Too many requests. Please try again later.' 
      });
    }

    logger.info('Processing forgot password request', { email });

    // Find user by email
    const [rows] = await pool.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );
    const user = (rows as any[])[0];

    if (!user) {
      // Don't reveal whether the email exists or not
      logger.info('Password reset requested for non-existent email', { email });
      return res.status(200).json({
        message: 'If an account exists with this email, password reset instructions have been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    logger.info('Generated reset token for user', { userId: user.id });

    // Store reset token in database
    await pool.execute(
      'UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, user.id]
    );

    logger.info('Reset token stored in database', { userId: user.id });

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetToken);
      logger.info('Password reset email sent successfully', { email });
    } catch (emailError) {
      logger.error('Failed to send password reset email', {
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
        email
      });
      // Don't fail the request if email sending fails
    }

    return res.status(200).json({
      message: 'If an account exists with this email, password reset instructions have been sent.'
    });
  } catch (error) {
    logger.error('Error in forgot password endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? (error instanceof Error ? error.message : 'Unknown error')
      : 'An error occurred while processing your request';

    return res.status(500).json({ 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.stack : undefined)
        : undefined
    });
  } finally {
    if (pool) {
      try {
        await pool.end();
        logger.info('Database connection closed');
      } catch (error) {
        logger.error('Error closing database connection', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }
} 