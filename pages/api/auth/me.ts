import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // In a real application, you would check the session/token here
    // For now, we'll just return a 401 if no user is logged in
    return res.status(401).json({ message: 'Not authenticated' });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 