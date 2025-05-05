import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { storageManager } from '../../../lib/storage';
import logger from '../../../lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    logger.info('Login attempt', { email });

    if (!email || !password) {
      logger.info('Missing email or password', { email });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await storageManager.findUserByEmail(email);
    if (!user) {
      logger.info('User not found during login', { email });
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isValid = await storageManager.verifyPassword(email, password);
    if (!isValid) {
      logger.info('Invalid password during login', { email });
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    logger.info('Login successful', { email });
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    logger.error('Login error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
} 