import express from 'express';
import Course from '../models/Course.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get course discussions
// @route   GET /api/courses/:courseId/discussions
// @access  Private
router.get('/:courseId/discussions', protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId)
      .populate('discussions.author', 'name email avatar role')
      .populate('discussions.replies.author', 'name email avatar role');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has access to this course (instructor or enrolled student)
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isEnrolled = course.enrolledStudents.some(student => 
      student.user.toString() === req.user._id.toString()
    );

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      discussions: course.discussions || []
    });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ 
      message: 'Server error fetching discussions',
      error: error.message 
    });
  }
});

// @desc    Create new discussion
// @route   POST /api/courses/:courseId/discussions
// @access  Private
router.post('/:courseId/discussions', protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, category, isPinned } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has access to this course
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isEnrolled = course.enrolledStudents.some(student => 
      student.user.toString() === req.user._id.toString()
    );

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only instructors can pin discussions
    const canPin = isInstructor && isPinned;

    const newDiscussion = {
      title,
      content,
      category: category || 'general',
      author: req.user._id,
      isPinned: canPin,
      isResolved: false,
      likes: [],
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    course.discussions = course.discussions || [];
    course.discussions.push(newDiscussion);
    await course.save();

    // Populate the author info for response
    await course.populate('discussions.author', 'name email avatar role');
    
    const createdDiscussion = course.discussions[course.discussions.length - 1];

    res.status(201).json({
      success: true,
      discussion: createdDiscussion
    });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ 
      message: 'Server error creating discussion',
      error: error.message 
    });
  }
});

// @desc    Add reply to discussion
// @route   POST /api/courses/:courseId/discussions/:discussionId/replies
// @access  Private
router.post('/:courseId/discussions/:discussionId/replies', protect, async (req, res) => {
  try {
    const { courseId, discussionId } = req.params;
    const { content } = req.body;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has access to this course
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isEnrolled = course.enrolledStudents.some(student => 
      student.user.toString() === req.user._id.toString()
    );

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const discussion = course.discussions.id(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const newReply = {
      content,
      author: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    discussion.replies = discussion.replies || [];
    discussion.replies.push(newReply);
    discussion.updatedAt = new Date();
    
    await course.save();

    // Populate the author info for response
    await course.populate('discussions.replies.author', 'name email avatar role');
    
    const createdReply = discussion.replies[discussion.replies.length - 1];

    res.status(201).json({
      success: true,
      reply: createdReply
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ 
      message: 'Server error adding reply',
      error: error.message 
    });
  }
});

export default router;
