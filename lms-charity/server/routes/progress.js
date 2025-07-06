import express from 'express';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user's progress for a specific course
// @route   GET /api/progress/:courseId
// @access  Private
router.get('/:courseId', protect, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId
    }).populate('course', 'title lessons');
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching progress' });
  }
});

// @desc    Get all user's course progress
// @route   GET /api/progress/user/all
// @access  Private
router.get('/user/all', protect, async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user._id })
      .populate('course', 'title thumbnail category level')
      .sort({ lastAccessed: -1 });
    
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user progress' });
  }
});

// @desc    Initialize or update course progress
// @route   POST /api/progress/start/:courseId
// @access  Private
router.post('/start/:courseId', protect, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is enrolled
    const isEnrolled = course.enrolledStudents.some(
      student => student.student.toString() === req.user._id.toString()
    );
    
    if (!isEnrolled) {
      return res.status(403).json({ message: 'You must be enrolled to track progress' });
    }
    
    // Find or create progress record
    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId
    });
    
    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: courseId,
        currentLesson: course.lessons.length > 0 ? course.lessons[0]._id : null
      });
    } else {
      progress.lastAccessed = new Date();
      await progress.updateStreak();
    }
    
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error starting course progress' });
  }
});

// @desc    Mark lesson as completed
// @route   POST /api/progress/complete-lesson
// @access  Private
router.post('/complete-lesson', protect, async (req, res) => {
  try {
    const { courseId, lessonId, timeSpent = 0, quizScore = null } = req.body;
    
    if (!courseId || !lessonId) {
      return res.status(400).json({ message: 'Course ID and Lesson ID are required' });
    }
    
    // Find progress record
    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId
    });
    
    if (!progress) {
      // Create new progress if it doesn't exist
      progress = await Progress.create({
        user: req.user._id,
        course: courseId
      });
    }
    
    // Complete the lesson
    await progress.completeLesson(lessonId, timeSpent, quizScore);
    await progress.updateStreak();
    
    // Update user's total learning time
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalLearningTime: timeSpent }
    });
    
    // If course is completed, update user's completed courses count
    if (progress.isCompleted) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { coursesCompleted: 1 }
      });
    }
    
    res.json({
      message: 'Lesson completed successfully',
      progress: progress.progressPercentage,
      isCompleted: progress.isCompleted,
      streak: progress.streakDays
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error completing lesson' });
  }
});

// @desc    Complete entire course
// @route   POST /api/progress/complete-course
// @access  Private
router.post('/complete-course', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }
    
    // Find progress record
    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId
    });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    // Mark course as completed
    progress.isCompleted = true;
    progress.completedAt = new Date();
    progress.progressPercentage = 100;
    await progress.save();
    
    // Update user's completed courses count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { coursesCompleted: 1 }
    });
    
    res.json({
      message: 'Course completed successfully',
      progress: progress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error completing course' });
  }
});

// @desc    Add bookmark to lesson
// @route   POST /api/progress/course/:courseId/bookmark
// @access  Private
router.post('/course/:courseId/bookmark', protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId, title, timestamp, note } = req.body;
    
    if (!lessonId || !title || timestamp === undefined) {
      return res.status(400).json({ 
        message: 'Lesson ID, title, and timestamp are required' 
      });
    }
    
    // Find or create progress record
    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId
    });
    
    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: courseId
      });
    }
    
    // Add bookmark
    await progress.addBookmark(lessonId, title, timestamp, note || '');
    
    res.json({
      message: 'Bookmark added successfully',
      bookmarks: progress.bookmarks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding bookmark' });
  }
});

// @desc    Remove bookmark
// @route   DELETE /api/progress/course/:courseId/bookmark/:bookmarkId
// @access  Private
router.delete('/course/:courseId/bookmark/:bookmarkId', protect, async (req, res) => {
  try {
    const { courseId, bookmarkId } = req.params;
    
    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId
    });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    // Remove bookmark
    await progress.removeBookmark(bookmarkId);
    
    res.json({
      message: 'Bookmark removed successfully',
      bookmarks: progress.bookmarks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing bookmark' });
  }
});

// @desc    Add note to lesson
// @route   POST /api/progress/course/:courseId/note
// @access  Private
router.post('/course/:courseId/note', protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId, title, content, timestamp } = req.body;
    
    if (!lessonId || !title || !content) {
      return res.status(400).json({ 
        message: 'Lesson ID, title, and content are required' 
      });
    }
    
    // Find or create progress record
    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId
    });
    
    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: courseId
      });
    }
    
    // Add note
    await progress.addNote(lessonId, title, content, timestamp || 0);
    
    res.json({
      message: 'Note added successfully',
      notes: progress.notes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding note' });
  }
});

// @desc    Update note
// @route   PUT /api/progress/course/:courseId/note/:noteId
// @access  Private
router.put('/course/:courseId/note/:noteId', protect, async (req, res) => {
  try {
    const { courseId, noteId } = req.params;
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        message: 'Title and content are required' 
      });
    }
    
    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId
    });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    // Update note
    await progress.updateNote(noteId, title, content);
    
    res.json({
      message: 'Note updated successfully',
      notes: progress.notes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating note' });
  }
});

// @desc    Remove note
// @route   DELETE /api/progress/course/:courseId/note/:noteId
// @access  Private
router.delete('/course/:courseId/note/:noteId', protect, async (req, res) => {
  try {
    const { courseId, noteId } = req.params;
    
    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId
    });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    // Remove note
    await progress.removeNote(noteId);
    
    res.json({
      message: 'Note removed successfully',
      notes: progress.notes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing note' });
  }
});

// @desc    Get learning analytics for user
// @route   GET /api/progress/analytics/user
// @access  Private
router.get('/analytics/user', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all user progress with published courses only
    const allProgress = await Progress.find({ user: userId })
      .populate({
        path: 'course',
        select: 'title category isPublished',
        match: { isPublished: true } // Only include published courses
      });
    
    // Filter out progress records where course is null (unpublished/deleted courses)
    const validProgress = allProgress.filter(p => p.course !== null);
    
    // Calculate analytics
    const totalCourses = validProgress.length;
    const completedCourses = validProgress.filter(p => p.isCompleted).length;
    const inProgressCourses = totalCourses - completedCourses;
    
    const totalLearningTime = validProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0);
    const averageProgress = totalCourses > 0 
      ? validProgress.reduce((sum, p) => sum + p.progressPercentage, 0) / totalCourses 
      : 0;
    
    // Learning by category
    const categoryStats = {};
    validProgress.forEach(p => {
      const category = p.course.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, completed: 0, timeSpent: 0 };
      }
      categoryStats[category].total++;
      if (p.isCompleted) categoryStats[category].completed++;
      categoryStats[category].timeSpent += p.totalTimeSpent;
    });
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = allProgress.filter(p => 
      p.lastAccessed >= sevenDaysAgo
    ).length;
    
    // Current streak
    const currentStreak = allProgress.length > 0 
      ? Math.max(...allProgress.map(p => p.streakDays)) 
      : 0;
    
    res.json({
      overview: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalLearningTime,
        averageProgress: Math.round(averageProgress),
        currentStreak,
        recentActivity
      },
      categoryStats,
      recentProgress: allProgress
        .sort((a, b) => b.lastAccessed - a.lastAccessed)
        .slice(0, 5)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching learning analytics' });
  }
});

// @desc    Get course analytics for instructor
// @route   GET /api/progress/analytics/course/:courseId
// @access  Private (Instructor)
router.get('/analytics/course/:courseId', protect, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    
    // Verify instructor owns the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get all progress for this course
    const courseProgress = await Progress.find({ course: courseId })
      .populate('user', 'name email');
    
    const totalStudents = courseProgress.length;
    const completedStudents = courseProgress.filter(p => p.isCompleted).length;
    const averageProgress = totalStudents > 0 
      ? courseProgress.reduce((sum, p) => sum + p.progressPercentage, 0) / totalStudents 
      : 0;
    
    const totalTimeSpent = courseProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0);
    const averageTimePerStudent = totalStudents > 0 ? totalTimeSpent / totalStudents : 0;
    
    // Lesson completion rates
    const lessonStats = {};
    courseProgress.forEach(progress => {
      progress.completedLessons.forEach(completedLesson => {
        const lessonId = completedLesson.lesson.toString();
        if (!lessonStats[lessonId]) {
          lessonStats[lessonId] = { completed: 0, totalTime: 0, quizScores: [] };
        }
        lessonStats[lessonId].completed++;
        lessonStats[lessonId].totalTime += completedLesson.timeSpent;
        if (completedLesson.quizScore !== null) {
          lessonStats[lessonId].quizScores.push(completedLesson.quizScore);
        }
      });
    });
    
    // Recent enrollments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEnrollments = courseProgress.filter(p => 
      p.startedAt >= thirtyDaysAgo
    ).length;
    
    res.json({
      overview: {
        totalStudents,
        completedStudents,
        completionRate: totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0,
        averageProgress: Math.round(averageProgress),
        totalTimeSpent,
        averageTimePerStudent: Math.round(averageTimePerStudent),
        recentEnrollments
      },
      lessonStats,
      studentProgress: courseProgress.sort((a, b) => b.progressPercentage - a.progressPercentage)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching course analytics' });
  }
});

// @desc    Reset course progress
// @route   DELETE /api/progress/:courseId/reset
// @access  Private
router.delete('/:courseId/reset', protect, async (req, res) => {
  try {
    const progress = await Progress.findOneAndDelete({
      user: req.user._id,
      course: req.params.courseId
    });
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    res.json({ message: 'Course progress reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error resetting progress' });
  }
});

// @desc    Clean up orphaned progress records
// @route   DELETE /api/progress/cleanup
// @access  Private
router.delete('/cleanup', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    console.log('=== Cleaning Up Progress Records ===');
    console.log('User ID:', userId);
    
    // Get all progress records for the user
    const allProgress = await Progress.find({ user: userId })
      .populate('course', '_id isPublished');
    
    // Find orphaned progress records (where course is null or unpublished)
    const orphanedProgress = allProgress.filter(p => 
      !p.course || !p.course.isPublished
    );
    
    console.log('Total progress records:', allProgress.length);
    console.log('Orphaned progress records:', orphanedProgress.length);
    
    if (orphanedProgress.length > 0) {
      const orphanedIds = orphanedProgress.map(p => p._id);
      
      // Remove orphaned progress records
      await Progress.deleteMany({ _id: { $in: orphanedIds } });
      
      console.log('Removed orphaned progress records:', orphanedIds.length);
    }
    
    res.json({
      success: true,
      message: 'Progress cleanup completed',
      data: {
        totalRecords: allProgress.length,
        orphanedRecords: orphanedProgress.length,
        remainingRecords: allProgress.length - orphanedProgress.length
      }
    });
    
  } catch (error) {
    console.error('Error cleaning up progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up progress records'
    });
  }
});

export default router;
