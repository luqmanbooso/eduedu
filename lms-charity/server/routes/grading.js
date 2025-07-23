import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect, restrictTo } from '../middleware/auth.js';
import scoreEssay from '../utils/scoreEssay.js';

const router = express.Router();

// @desc    Grade a submission
// @route   PUT /api/grading/submissions/:submissionId
// @access  Private (Instructor)
router.put('/submissions/:submissionId', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    const { grade, feedback, status } = req.body;
    const { submissionId } = req.params;

    const course = await Course.findOne({ 'modules.lessons.assignment.submissions._id': submissionId });
    if (!course) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    let foundSubmission = null;
    let foundLesson = null;

    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.assignment && lesson.assignment.submissions) {
          const submission = lesson.assignment.submissions.id(submissionId);
          if (submission) {
            foundSubmission = submission;
            foundLesson = lesson;
            break;
          }
        }
      }
      if (foundSubmission) break;
    }

    if (!foundSubmission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    foundSubmission.grade = grade;
    foundSubmission.feedback = feedback;
    foundSubmission.status = status;
    foundSubmission.gradedAt = new Date();

    if (status === 'approved') {
      const user = await User.findById(foundSubmission.student);
      const enrollment = course.enrolledStudents.find(e => e.student.toString() === user._id.toString());
      if (enrollment && !enrollment.completedLessons.includes(foundLesson._id)) {
        enrollment.completedLessons.push(foundLesson._id);
        const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
        enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
      }
    }

    await course.save();
    res.json(foundSubmission);
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Score an essay with AI
// @route   POST /api/grading/score-essay
// @access  Private (Instructor)
router.post('/score-essay', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    const { essayText } = req.body;
    if (!essayText) {
      return res.status(400).json({ message: 'Essay text is required' });
    }
    const result = await scoreEssay(essayText);
    res.json(result);
  } catch (error) {
    console.error('Error scoring essay:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
