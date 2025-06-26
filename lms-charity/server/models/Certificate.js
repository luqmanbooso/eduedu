import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateId: {
    type: String,
    unique: true,
    required: true
  },
  completionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'Pass'],
    default: 'Pass'
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    required: false
  },
  certificateUrl: {
    type: String,
    required: false // Will be generated when certificate is created
  },
  verificationCode: {
    type: String,
    unique: true,
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be system-issued
  },
  skills: [String], // Skills gained from the course
  creditsEarned: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: false // Some certificates don't expire
  },
  isValid: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloaded: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Index for performance and verification
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ verificationCode: 1 });
certificateSchema.index({ user: 1, course: 1 });

// Generate unique certificate ID
certificateSchema.pre('save', function(next) {
  if (!this.certificateId) {
    const year = new Date().getFullYear();
    const randomId = Math.random().toString(36).substring(2, 15);
    this.certificateId = `CERT-${year}-${randomId.toUpperCase()}`;
  }
  
  if (!this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substring(2, 15).toUpperCase();
  }
  
  next();
});

// Static method to verify certificate
certificateSchema.statics.verifyCertificate = async function(certificateId, verificationCode) {
  try {
    const certificate = await this.findOne({
      certificateId,
      verificationCode,
      isValid: true
    }).populate('user', 'name email').populate('course', 'title');
    
    return certificate;
  } catch (error) {
    console.error('Error verifying certificate:', error);
    throw error;
  }
};

// Instance method to mark as downloaded
certificateSchema.methods.markAsDownloaded = function() {
  this.downloadCount += 1;
  this.lastDownloaded = new Date();
  return this.save();
};

export default mongoose.model('Certificate', certificateSchema);
