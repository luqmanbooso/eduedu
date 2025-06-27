import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  url: String,
  publicId: String, // Cloudinary public ID for deletion
  type: {
    type: String,
    enum: ['video', 'pdf', 'image', 'document', 'link'],
    required: true
  },
  size: Number, // File size in bytes
  format: String, // File format
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0
  },
  explanation: String,
  points: {
    type: Number,
    default: 1
  }
});

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructions: String,
  resources: [resourceSchema],
  maxScore: {
    type: Number,
    default: 100
  },
  dueDate: Date,
  submissionType: {
    type: String,
    enum: ['file', 'text', 'both'],
    default: 'both'
  },
  allowedFormats: [String], // For file submissions
  maxFileSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  }
});

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a lesson title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a lesson description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  content: String, // Rich text content
  videoUrl: String,
  videoDuration: Number, // in seconds
  videoPublicId: String, // Cloudinary public ID
  order: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'text', 'quiz', 'assignment', 'live'],
    default: 'video'
  },
  resources: [resourceSchema],
  quiz: {
    questions: [quizQuestionSchema],
    timeLimit: Number, // in minutes
    attemptsAllowed: {
      type: Number,
      default: 3
    },
    passingScore: {
      type: Number,
      default: 70
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    }
  },
  assignment: assignmentSchema,
  isPreview: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a module title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  order: {
    type: Number,
    required: true
  },
  lessons: [lessonSchema],
  estimatedDuration: Number, // in hours
  prerequisites: [String],
  learningObjectives: [String]
}, {
  timestamps: true
});

const liveSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true // in minutes
  },
  meetingUrl: String,
  meetingId: String,
  meetingPassword: String,
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  attendees: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    leftAt: Date
  }],
  recording: {
    url: String,
    publicId: String,
    duration: Number
  }
}, {
  timestamps: true
});

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'question', 'announcement', 'assignment-help'],
    default: 'general'
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  replies: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Programming', 'Design', 'Business', 'Marketing', 'Science', 'Language', 'Data Science', 'AI/ML', 'Cybersecurity', 'Other']
  },
  subcategory: String,
  level: {
    type: String,
    required: [true, 'Please select a level'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thumbnail: {
    url: String,
    publicId: String
  },
  previewVideo: {
    url: String,
    publicId: String,
    duration: Number
  },
  modules: [moduleSchema],
  liveSessions: [liveSessionSchema],
  discussions: [discussionSchema],
  requirements: [String],
  learningOutcomes: [String],
  targetAudience: [String],
  tags: [String],
  language: {
    type: String,
    default: 'English'
  },
  subtitles: [String], // Available subtitle languages
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  duration: {
    type: Number, // Total duration in hours
    default: 0
  },
  estimatedCompletionTime: String, // e.g., "6 weeks at 3-4 hours/week"
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  certificate: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    template: String, // Certificate template ID
    requirements: {
      minimumScore: {
        type: Number,
        default: 70
      },
      completionPercentage: {
        type: Number,
        default: 100
      }
    }
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  publishedAt: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedLessons: [{
      type: mongoose.Schema.Types.ObjectId
    }],
    quizScores: [{
      lessonId: mongoose.Schema.Types.ObjectId,
      score: Number,
      attempts: Number,
      lastAttempt: Date
    }],
    assignmentSubmissions: [{
      lessonId: mongoose.Schema.Types.ObjectId,
      submissionUrl: String,
      grade: Number,
      feedback: String,
      submittedAt: Date,
      gradedAt: Date
    }],
    certificateIssued: {
      type: Boolean,
      default: false
    },
    certificateUrl: String,
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    },
    helpfulVotes: {
      type: Number,
      default: 0
    },
    votedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    enrollments: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    },
    averageCompletionTime: Number, // in days
    dropoffPoints: [{ // Where students typically drop off
      lessonId: mongoose.Schema.Types.ObjectId,
      count: Number
    }],
    engagementScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  settings: {
    allowDiscussions: {
      type: Boolean,
      default: true
    },
    allowDownloads: {
      type: Boolean,
      default: true
    },
    allowReviews: {
      type: Boolean,
      default: true
    },
    autoApproveReviews: {
      type: Boolean,
      default: false
    },
    maxStudents: Number, // Enrollment limit
    enrollmentDeadline: Date,
    startDate: Date,
    endDate: Date
  }
}, {
  timestamps: true
});

// Calculate total duration from all modules and lessons
courseSchema.virtual('totalDuration').get(function() {
  if (!this.modules || !Array.isArray(this.modules)) return 0;
  return this.modules.reduce((total, module) => {
    if (!module.lessons || !Array.isArray(module.lessons)) return total;
    return total + module.lessons.reduce((moduleTotal, lesson) => {
      return moduleTotal + (lesson.videoDuration || 0);
    }, 0);
  }, 0) / 3600; // Convert seconds to hours
});

// Calculate total lessons count
courseSchema.virtual('totalLessons').get(function() {
  if (!this.modules || !Array.isArray(this.modules)) return 0;
  return this.modules.reduce((total, module) => {
    if (!module.lessons || !Array.isArray(module.lessons)) return total;
    return total + module.lessons.length;
  }, 0);
});

// Calculate student count
courseSchema.virtual('studentCount').get(function() {
  if (!this.enrolledStudents || !Array.isArray(this.enrolledStudents)) return 0;
  return this.enrolledStudents.length;
});

// Calculate completion rate
courseSchema.virtual('completionRate').get(function() {
  if (!this.enrolledStudents || !Array.isArray(this.enrolledStudents) || this.enrolledStudents.length === 0) return 0;
  const completedStudents = this.enrolledStudents.filter(enrollment => enrollment.progress === 100).length;
  return (completedStudents / this.enrolledStudents.length) * 100;
});

// Generate course slug
courseSchema.pre('save', function(next) {
  if (this.isModified('title') && (!this.seo || !this.seo.slug)) {
    if (!this.seo) {
      this.seo = {};
    }
    this.seo.slug = this.title.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
  
  // Update lastUpdated when course content is modified
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date();
  }
  
  next();
});

// Update analytics when enrollments change
courseSchema.pre('save', function(next) {
  if (this.isModified('enrolledStudents')) {
    this.analytics.enrollments = this.enrolledStudents.length;
  }
  next();
});

// Methods for course management
courseSchema.methods.enrollStudent = function(studentId) {
  const existingEnrollment = this.enrolledStudents.find(
    enrollment => enrollment.student.toString() === studentId.toString()
  );
  
  if (existingEnrollment) {
    throw new Error('Student is already enrolled in this course');
  }
  
  this.enrolledStudents.push({
    student: studentId,
    enrolledAt: new Date(),
    progress: 0
  });
  
  this.analytics.enrollments = this.enrolledStudents.length;
  return this.save();
};

courseSchema.methods.updateStudentProgress = function(studentId, completedLessonId) {
  const enrollment = this.enrolledStudents.find(
    enrollment => enrollment.student.toString() === studentId.toString()
  );
  
  if (!enrollment) {
    throw new Error('Student is not enrolled in this course');
  }
  
  if (!enrollment.completedLessons.includes(completedLessonId)) {
    enrollment.completedLessons.push(completedLessonId);
  }
  
  // Calculate progress percentage
  const totalLessons = this.totalLessons;
  enrollment.progress = totalLessons > 0 ? (enrollment.completedLessons.length / totalLessons) * 100 : 0;
  enrollment.lastActivity = new Date();
  
  // Check if course is completed
  if (enrollment.progress === 100 && !enrollment.certificateIssued) {
    this.analytics.completions += 1;
  }
  
  return this.save();
};

courseSchema.methods.addReview = function(userId, rating, comment) {
  // Check if user already reviewed
  const existingReview = this.reviews.find(
    review => review.user.toString() === userId.toString()
  );
  
  if (existingReview) {
    // Update existing review
    const oldRating = existingReview.rating;
    existingReview.rating = rating;
    existingReview.comment = comment;
    existingReview.createdAt = new Date();
    
    // Update rating distribution
    this.rating.distribution[oldRating] -= 1;
    this.rating.distribution[rating] += 1;
  } else {
    // Add new review
    this.reviews.push({
      user: userId,
      rating,
      comment,
      isVerifiedPurchase: this.enrolledStudents.some(
        enrollment => enrollment.student.toString() === userId.toString()
      )
    });
    
    this.rating.count += 1;
    this.rating.distribution[rating] += 1;
  }
  
  // Recalculate average rating
  const totalRating = Object.keys(this.rating.distribution).reduce((sum, star) => {
    return sum + (parseInt(star) * this.rating.distribution[star]);
  }, 0);
  
  this.rating.average = this.rating.count > 0 ? totalRating / this.rating.count : 0;
  
  return this.save();
};

// Indexes for better performance
courseSchema.index({ instructor: 1, status: 1 });
courseSchema.index({ category: 1, level: 1, isPublished: 1 });
courseSchema.index({ 'rating.average': -1, 'analytics.enrollments': -1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ 'seo.slug': 1 });
courseSchema.index({ createdAt: -1 });

// Ensure virtual fields are serialized
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

export default mongoose.model('Course', courseSchema);
