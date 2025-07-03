import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetCode, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Code - EduCharity',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .code-box { background-color: #e7f3ff; border: 2px solid #2196F3; padding: 15px; margin: 20px 0; text-align: center; border-radius: 8px; }
            .code { font-size: 32px; font-weight: bold; color: #1976D2; letter-spacing: 3px; }
            .footer { padding: 20px; text-align: center; color: #666; background-color: #f0f0f0; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 4px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>We received a request to reset your password for your EduCharity account.</p>
              
              <div class="code-box">
                <p style="margin: 0; font-size: 18px; color: #333;">Your verification code is:</p>
                <div class="code">${resetCode}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 5px 0; padding-left: 20px;">
                  <li>This code is valid for 15 minutes only</li>
                  <li>Never share this code with anyone</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                </ul>
              </div>
              
              <p>To complete your password reset:</p>
              <ol>
                <li>Go back to the password reset page</li>
                <li>Enter the verification code above</li>
                <li>Create your new password</li>
              </ol>
              
              <p>If you have any questions, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2025 EduCharity. All rights reserved.</p>
              <p style="font-size: 12px; color: #999;">This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send password change confirmation email
export const sendPasswordChangeConfirmation = async (email, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Changed Successfully - EduCharity',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; background-color: #f0f0f0; }
            .success-box { background-color: #e8f5e8; border: 2px solid #4CAF50; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Changed Successfully</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              
              <div class="success-box">
                <h3 style="color: #4CAF50; margin: 0;">🔐 Your password has been updated</h3>
                <p style="margin: 10px 0 0 0;">Changed on: ${new Date().toLocaleString()}</p>
              </div>
              
              <p>Your EduCharity account password has been successfully changed. You can now log in with your new password.</p>
              
              <p><strong>If you didn't make this change:</strong></p>
              <ul>
                <li>Contact our support team immediately</li>
                <li>Check your account security settings</li>
                <li>Consider enabling two-factor authentication</li>
              </ul>
              
              <p>Thank you for keeping your account secure!</p>
            </div>
            <div class="footer">
              <p>© 2025 EduCharity. All rights reserved.</p>
              <p style="font-size: 12px; color: #999;">This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password change confirmation sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending password change confirmation:', error);
    // Don't throw error for confirmation emails - it's not critical
    return { success: false, error: error.message };
  }
};

// General email sending function
export const sendEmail = async ({ email, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"EduCharity" <noreply@educarity.com>',
      to: email,
      subject,
      html,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
