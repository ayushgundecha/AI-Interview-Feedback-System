import nodemailer from 'nodemailer';
import logger from './logger';

// Validate email configuration
function validateEmailConfig() {
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.error('Missing email configuration variables', { missingVars });
    throw new Error(`Missing required email environment variables: ${missingVars.join(', ')}`);
  }

  const port = parseInt(process.env.EMAIL_PORT as string);
  if (isNaN(port) || port < 1 || port > 65535) {
    logger.error('Invalid email port configuration', { port: process.env.EMAIL_PORT });
    throw new Error('Invalid email port configuration');
  }
}

// Create email transporter
function createTransporter() {
  try {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD // Use App Password for Gmail
      }
    });
  } catch (error) {
    logger.error('Failed to create email transporter', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

const transporter = createTransporter();

// Verify transporter connection
async function verifyTransporter() {
  try {
    await transporter.verify();
    logger.info('Email transporter verified successfully');
  } catch (error) {
    logger.error('Email transporter verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Verify connection on startup
verifyTransporter().catch(error => {
  logger.error('Failed to verify email transporter on startup', {
    error: error instanceof Error ? error.message : 'Unknown error'
  });
});

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  if (!email || !resetToken) {
    logger.error('Missing required parameters for password reset email', {
      email: !!email,
      resetToken: !!resetToken
    });
    throw new Error('Missing required parameters for password reset email');
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Password reset email sent successfully', {
      email,
      messageId: info.messageId
    });
    return info;
  } catch (error) {
    logger.error('Failed to send password reset email', {
      error: error instanceof Error ? error.message : 'Unknown error',
      email
    });
    throw error;
  }
} 