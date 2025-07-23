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

/**
 * @desc    Submit essay assignment for a lesson (with ML scoring)
 * @route   POST /api/courses/:courseId/modules/:moduleId/lessons/:lessonId/submit-essay
 * @access  Private (Student)
 */
import scoreEssay from '../utils/scoreEssay.js';

router.post('/courses/:courseId/modules/:moduleId/lessons/:lessonId/submit-essay', protect, async (req, res) => {
  try {
    const { essayText } = req.body;
    const { courseId, moduleId, lessonId } = req.params;
    console.log('Essay submission request:', { courseId, moduleId, lessonId, user: req.user?._id, essayText });
    if (!essayText) {
      console.error('Missing essayText');
      return res.status(400).json({ message: 'Essay text is required.' });
    }

    // Find course, module, lesson
    const course = await Course.findById(courseId);
    if (!course) {
      console.error('Course not found:', courseId);
      return res.status(404).json({ message: 'Course not found.' });
    }
    const module = course.modules.id(moduleId);
    if (!module) {
      console.error('Module not found:', moduleId);
      return res.status(404).json({ message: 'Module not found.' });
    }
    const lesson = module.lessons.id(lessonId);
    if (!lesson) {
      console.error('Lesson not found:', lessonId);
      return res.status(404).json({ message: 'Lesson not found.' });
    }

    // Check enrollment
    const enrollment = course.enrolledStudents.find(e => e.student.toString() === req.user._id.toString());
    if (!enrollment) {
      console.error('User not enrolled:', req.user?._id);
      return res.status(403).json({ message: 'You are not enrolled in this course.' });
    }

    // Check assignment exists
    if (!lesson.assignment) {
      console.error('No assignment for lesson:', lessonId);
      return res.status(400).json({ message: 'No assignment for this lesson.' });
    }

    // Prevent duplicate submissions (or allow multiple attempts with timestamps)
    const alreadySubmitted = lesson.assignment.submissions.find(sub => sub.student.toString() === req.user._id.toString());
    if (alreadySubmitted) {
      console.error('Duplicate submission by user:', req.user?._id);
      return res.status(409).json({ message: 'You have already submitted this assignment.' });
    }

    // Score essay using ML microservice
    const mlResult = await scoreEssay(essayText);
    if (mlResult.error) {
      console.error('ML scoring error:', mlResult.error);
      return res.status(500).json({ message: 'Essay scoring failed.', error: mlResult.error });
    }

    // Store submission
    lesson.assignment.submissions.push({
      student: req.user._id,
      essayText,
      grade: mlResult.score,
      feedback: mlResult.feedback,
      submittedAt: new Date(),
      gradedAt: new Date()
    });
    await course.save();

    console.log('Essay submitted and scored:', { score: mlResult.score, feedback: mlResult.feedback });
    res.status(201).json({
      message: 'Essay submitted and scored successfully.',
      score: mlResult.score,
      feedback: mlResult.feedback
    });
  } catch (error) {
    console.error('Essay submission error:', error);
    res.status(500).json({ message: 'Server error submitting essay.', error: error.message });
  }
});

// @desc    Submit assignment for a lesson
// @route   POST /api/lessons/:lessonId/submit
// @access  Private (Student)
router.post('/:lessonId/submit', protect, async (req, res) => {
  try {
    const { courseId, content, files } = req.body;
    
    // Find the course containing the lesson
    const course = await Course.findOne({ 'modules.lessons._id': req.params.lessonId });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    let foundLesson = null;
    for (const module of course.modules) {
      const lesson = module.lessons.id(req.params.lessonId);
      if (lesson) {
        foundLesson = lesson;
        break;
      }
    }

    if (!foundLesson || !foundLesson.assignment) {
      return res.status(404).json({ message: 'Assignment not found for this lesson' });
    }

    // Create new submission
    const newSubmission = {
      student: req.user._id,
      content,
      files,
      submittedAt: new Date(),
    };

    foundLesson.assignment.submissions.push(newSubmission);
    await course.save();

    res.status(201).json({ 
      message: 'Assignment submitted successfully', 
      submission: newSubmission 
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Server error submitting assignment' });
  }
});

export default router;
