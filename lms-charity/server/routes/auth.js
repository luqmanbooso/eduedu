import express from 'express';
import User from '../models/User.js';
import { protect, generateToken } from '../middleware/auth.js';
import { admin } from '../firebase-admin.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { sendEmail, sendPasswordResetEmail, sendPasswordChangeConfirmation } from '../utils/emailService.js';

const router = express.Router();

// In-memory OTP store for demo (replace with DB in production)
const adminOtpStore = {};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate role
    if (role && !['student', 'instructor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message 
    });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (user.email === 'luqmanbooso@gmail.com' && user.role === 'admin') {
        // Generate a one-time token (JWT, expires in 10 min)
        const approvalToken = jwt.sign(
          { userId: user._id, email: user.email, type: 'admin-approve' },
          process.env.JWT_SECRET,
          { expiresIn: '10m' }
        );
        // Send approval email
        const approveUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin-approve?token=${approvalToken}`;
        await sendEmail(user.email, 'EduCharity Admin Login Confirmation', `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2>Welcome Admin!</h2>
              <p>Please confirm it's you by clicking the button below:</p>
              <a href="${approveUrl}" style="display:inline-block;padding:12px 24px;background:#a435f0;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Approve Admin Login</a>
              <p>This link will expire in 10 minutes.</p>
            </div>
          `);
        return res.status(200).json({ message: 'Check your email to confirm this login.' });
      }
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio
        },
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses.course', 'title thumbnail')
      .populate('createdCourses', 'title thumbnail studentCount');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error getting user profile',
      error: error.message 
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
      user.name = name || user.name;
      user.bio = bio || user.bio;
      user.avatar = avatar || user.avatar;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error updating profile',
      error: error.message 
    });
  }
});

// @desc    Google OAuth authentication
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { email, displayName, photoURL, uid, idToken } = req.body;

    if (!email || !displayName || !uid) {
      return res.status(400).json({ message: 'Missing required Google user data' });
    }

    // Verify Firebase ID token if provided (optional for extra security)
    if (idToken) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.uid !== uid) {
          return res.status(401).json({ message: 'Invalid Firebase token' });
        }
      } catch (firebaseError) {
        console.error('Firebase token verification failed:', firebaseError);
        // Continue without token verification for now
      }
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists, update Google info if needed
      if (!user.googleId) {
        user.googleId = uid;
        user.avatar = photoURL || user.avatar;
        user.authProvider = 'google';
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name: displayName,
        email,
        googleId: uid,
        avatar: photoURL,
        role: 'student', // Default role
        password: null, // No password for Google users
        authProvider: 'google'
      });
    }

    // Generate token and return user data
    const token = generateToken(user._id);

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider
      },
      token
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      message: 'Server error during Google authentication',
      error: error.message 
    });
  }
});

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({ 
        message: 'If an account with that email exists, a reset code has been sent.',
        success: true 
      });
    }

    // Check if user is Google auth user
    if (user.authProvider === 'google') {
      return res.status(400).json({ 
        message: 'This account uses Google authentication. Please use Google to sign in.' 
      });
    }

    // Generate reset token and code
    const { resetToken, resetCode } = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      // Send email with reset code
      await sendPasswordResetEmail(email, resetCode, user.name);
      
      res.status(200).json({
        success: true,
        message: 'Password reset code sent to your email',
        resetToken // Send token to frontend for verification step
      });
    } catch (error) {
      // Clear reset fields if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordCode = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ 
        message: 'Failed to send reset email. Please try again later.',
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'Server error during password reset request',
      error: error.message 
    });
  }
});

// @desc    Verify reset code
// @route   POST /api/auth/verify-reset-code
// @access  Public
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { resetToken, code } = req.body;

    if (!resetToken || !code) {
      return res.status(400).json({ message: 'Reset token and code are required' });
    }

    // Find user by reset token
    const user = await User.findOne({ 
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordCode +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Verify the code
    if (!user.verifyResetCode(code)) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    res.status(200).json({
      success: true,
      message: 'Verification code is valid',
      resetToken // Return token for password reset step
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ 
      message: 'Server error during code verification',
      error: error.message 
    });
  }
});

// @desc    Reset password with new password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find user by reset token
    const user = await User.findOne({ 
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordCode +resetPasswordExpires +resetPasswordToken');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password
    user.password = newPassword;
    
    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    // Send confirmation email (don't wait for it)
    sendPasswordChangeConfirmation(user.email, user.name).catch(console.error);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'Server error during password reset',
      error: error.message 
    });
  }
});

// GET: Just verify token for frontend
router.get('/admin-approve', (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (
      decoded.type !== 'admin-approve' ||
      decoded.email !== 'luqmanbooso@gmail.com'
    ) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    return res.status(200).json({ message: 'Token valid.' });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
});
// POST: Actually approve and issue login token
router.post('/admin-approve', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (
      decoded.type !== 'admin-approve' ||
      decoded.email !== 'luqmanbooso@gmail.com'
    ) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const loginToken = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({ loginToken });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

// Step 1: Admin login - send OTP
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body;
  if (email === 'luqmanbooso@gmail.com' && password === 'yourAdminPassword') {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Store OTP and expiry (10 min)
    adminOtpStore[email] = { otp, expires: Date.now() + 10 * 60 * 1000 };
    await sendEmail(email, 'Your Admin Login OTP', `<h1>Your OTP: ${otp}</h1><p>Valid for 10 minutes.</p>`);
    res.status(200).json({ message: 'OTP sent to your email.' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Step 2: Verify OTP
router.post('/admin-verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const record = adminOtpStore[email];
  if (record && record.otp === otp && record.expires > Date.now()) {
    // OTP valid, issue JWT
    const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Clean up OTP
    delete adminOtpStore[email];
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid or expired OTP' });
  }
});

export default router;
