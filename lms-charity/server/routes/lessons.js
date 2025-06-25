import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Mark lesson as complete
// @route   POST /api/lessons/:lessonId/complete
// @access  Private (Student)
router.post('/:lessonId/complete', protect, async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Find the course and lesson
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is enrolled in the course
    const enrollment = course.enrolledStudents.find(
      e => e.student.toString() === req.user._id.toString()
    );

    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Update user's progress
    const user = await User.findById(req.user._id);
    const userCourse = user.enrolledCourses.find(
      ec => ec.course.toString() === courseId
    );

    if (!userCourse) {
      return res.status(404).json({ message: 'Course not found in user enrollment' });
    }

    // Add lesson to completed lessons if not already completed
    if (!userCourse.completedLessons.includes(req.params.lessonId)) {
      userCourse.completedLessons.push(req.params.lessonId);
      
      // Calculate progress percentage
      const totalLessons = course.lessons.length;
      const completedLessons = userCourse.completedLessons.length;
      userCourse.progress = Math.round((completedLessons / totalLessons) * 100);
      
      await user.save();
    }

    res.json({
      message: 'Lesson marked as complete',
      progress: userCourse.progress,
      completedLessons: userCourse.completedLessons.length,
      totalLessons: course.lessons.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error marking lesson complete',
      error: error.message 
    });
  }
});

// @desc    Get lesson progress for user
// @route   GET /api/lessons/progress/:courseId
// @access  Private
router.get('/progress/:courseId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const courseProgress = user.enrolledCourses.find(
      ec => ec.course.toString() === req.params.courseId
    );

    if (!courseProgress) {
      return res.status(404).json({ message: 'Course not found in user enrollment' });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({
      courseId: req.params.courseId,
      progress: courseProgress.progress,
      completedLessons: courseProgress.completedLessons,
      totalLessons: course.lessons.length,
      enrolledAt: courseProgress.enrolledAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error fetching progress',
      error: error.message 
    });
  }
});

// @desc    Submit quiz answer
// @route   POST /api/lessons/:lessonId/quiz
// @access  Private (Student)
router.post('/:lessonId/quiz', protect, async (req, res) => {
  try {
    const { courseId, answers } = req.body;

    if (!courseId || !answers) {
      return res.status(400).json({ message: 'Course ID and answers are required' });
    }

    // Find the course and lesson
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (!lesson.quiz || !lesson.quiz.questions.length) {
      return res.status(400).json({ message: 'No quiz available for this lesson' });
    }

    // Check if user is enrolled
    const enrollment = course.enrolledStudents.find(
      e => e.student.toString() === req.user._id.toString()
    );

    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = lesson.quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
    });

    const score = Math.round((correctAnswers / lesson.quiz.questions.length) * 100);
    const passed = score >= lesson.quiz.passingScore;

    res.json({
      score,
      passed,
      passingScore: lesson.quiz.passingScore,
      results,
      totalQuestions: lesson.quiz.questions.length,
      correctAnswers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error submitting quiz',
      error: error.message 
    });
  }
});

export default router;
