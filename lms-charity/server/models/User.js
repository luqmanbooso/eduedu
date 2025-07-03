import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password not required if Google auth
    },
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String,
    website: String
  },
  skills: [String],
  location: String,
  phoneNumber: String,
  dateOfBirth: Date,
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    courseRecommendations: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  lastLogin: Date,
  totalLearningTime: {
    type: Number,
    default: 0 // in minutes
  },
  certificatesEarned: {
    type: Number,
    default: 0
  },
  coursesCompleted: {
    type: Number,
    default: 0
  },
  enrolledCourses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    },
    completedLessons: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }]
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  googleId: {
    type: String,
    sparse: true, // Allows multiple null values
    unique: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  // Password reset fields
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordCode: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  // Skip password hashing for Google auth users or if password not modified
  if (!this.isModified('password') || !this.password) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token and code
userSchema.methods.getResetPasswordToken = function() {
  // Generate a 6-digit code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Generate a secure token
  const resetToken = require('crypto').randomBytes(20).toString('hex');
  
  // Hash and set the code
  this.resetPasswordCode = require('crypto')
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');
  
  // Set token
  this.resetPasswordToken = resetToken;
  
  // Set expire time (15 minutes)
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  
  return { resetToken, resetCode };
};

// Verify reset code
userSchema.methods.verifyResetCode = function(code) {
  const hashedCode = require('crypto')
    .createHash('sha256')
    .update(code)
    .digest('hex');
  
  return this.resetPasswordCode === hashedCode && 
         this.resetPasswordExpires > Date.now();
};

export default mongoose.model('User', userSchema);
