import { NextApiRequest, NextApiResponse } from 'next';
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
    const { email, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      logger.error('Missing required fields', { 
        email: !!email, 
        password: !!password, 
        firstName: !!firstName, 
        lastName: !!lastName 
      });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    logger.info('Attempting to create user', { email });

    // Create user using storage manager
    const user = await storageManager.createUser(email, password, firstName, lastName);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    logger.info('User created successfully', { email });
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    logger.error('Signup error:', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      email: req.body?.email 
    });

    if (error instanceof Error && error.message === 'User already exists') {
      return res.status(409).json({ message: 'Email already in use' });
    }

    return res.status(500).json({ message: 'Failed to create account' });
  }
} 