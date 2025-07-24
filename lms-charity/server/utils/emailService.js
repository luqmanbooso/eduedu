import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

console.log('GMAIL_USER (emailService.js):', process.env.GMAIL_USER);
console.log('GMAIL_APP_PASSWORD (emailService.js):', process.env.GMAIL_APP_PASSWORD ? 'SET' : 'MISSING');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"EduCharity" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Example password reset email function
export const sendPasswordResetEmail = async (to, code) => {
  const html = `<h1>Your password reset code: ${code}</h1><p>Valid for 10 minutes.</p>`;
  await sendEmail(to, 'Password Reset Code', html);
};

// Example password change confirmation function
export const sendPasswordChangeConfirmation = async (to) => {
  const html = `<h1>Your password has been changed successfully.</h1>`;
  await sendEmail(to, 'Password Changed', html);
};
