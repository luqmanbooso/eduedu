import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
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
  completedLessons: [{
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0
    },
    quizScore: {
      type: Number,
      min: 0,
      max: 100,
      required: false
    }
  }],
  currentLesson: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  progressPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  totalTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    required: false
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  averageQuizScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  streakDays: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  bookmarks: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    timestamp: {
      type: Number, // Video timestamp in seconds
      required: true
    },
    note: {
      type: String,
      maxLength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    title: {
      type: String,
      required: true,
      maxLength: 200
    },
    content: {
      type: String,
      required: true,
      maxLength: 2000
    },
    timestamp: {
      type: Number, // Video timestamp in seconds
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound index for user-course combination
progressSchema.index({ user: 1, course: 1 }, { unique: true });
progressSchema.index({ user: 1, lastAccessed: -1 });
progressSchema.index({ course: 1, progressPercentage: -1 });

// Calculate progress percentage
progressSchema.methods.calculateProgress = async function() {
  try {
    const Course = mongoose.model('Course');
    const course = await Course.findById(this.course);
    
    if (!course || course.lessons.length === 0) {
      this.progressPercentage = 0;
      return 0;
    }
    
    const totalLessons = course.lessons.length;
    const completedLessons = this.completedLessons.length;
    
    this.progressPercentage = Math.round((completedLessons / totalLessons) * 100);
    
    // Mark as completed if all lessons are done
    if (this.progressPercentage === 100) {
      this.isCompleted = true;
      this.completedAt = new Date();
    }
    
    await this.save();
    return this.progressPercentage;
  } catch (error) {
    console.error('Error calculating progress:', error);
    throw error;
  }
};

// Mark lesson as completed
progressSchema.methods.completeLesson = async function(lessonId, timeSpent = 0, quizScore = null) {
  try {
    // Check if lesson is already completed
    const existingCompletion = this.completedLessons.find(
      completion => completion.lesson.toString() === lessonId.toString()
    );
    
    if (!existingCompletion) {
      this.completedLessons.push({
        lesson: lessonId,
        completedAt: new Date(),
        timeSpent: timeSpent,
        quizScore: quizScore
      });
      
      this.totalTimeSpent += timeSpent;
      this.lastAccessed = new Date();
      
      // Update average quiz score if applicable
      if (quizScore !== null) {
        const quizScores = this.completedLessons
          .filter(completion => completion.quizScore !== null)
          .map(completion => completion.quizScore);
        
        this.averageQuizScore = Math.round(
          quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length
        );
      }
      
      await this.calculateProgress();
    }
    
    return this;
  } catch (error) {
    console.error('Error completing lesson:', error);
    throw error;
  }
};

// Update learning streak
progressSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActive = new Date(this.lastActiveDate);
  const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    // Consecutive day
    this.streakDays += 1;
  } else if (daysDiff > 1) {
    // Streak broken
    this.streakDays = 1;
  }
  // If same day, keep current streak
  
  this.lastActiveDate = today;
  return this.save();
};

// Add bookmark
progressSchema.methods.addBookmark = function(lessonId, title, timestamp, note = '') {
  this.bookmarks.push({
    lessonId,
    title,
    timestamp,
    note,
    createdAt: new Date()
  });
  return this.save();
};

// Remove bookmark
progressSchema.methods.removeBookmark = function(bookmarkId) {
  this.bookmarks = this.bookmarks.filter(bookmark => 
    bookmark._id.toString() !== bookmarkId.toString()
  );
  return this.save();
};

// Add note
progressSchema.methods.addNote = function(lessonId, title, content, timestamp = 0) {
  this.notes.push({
    lessonId,
    title,
    content,
    timestamp,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return this.save();
};

// Update note
progressSchema.methods.updateNote = function(noteId, title, content) {
  const note = this.notes.id(noteId);
  if (note) {
    note.title = title;
    note.content = content;
    note.updatedAt = new Date();
  }
  return this.save();
};

// Remove note
progressSchema.methods.removeNote = function(noteId) {
  this.notes = this.notes.filter(note => 
    note._id.toString() !== noteId.toString()
  );
  return this.save();
};

export default mongoose.model('Progress', progressSchema);
