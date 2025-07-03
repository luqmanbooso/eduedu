import express from 'express';
import Comment from '../models/Comment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get comments for a course or lesson
// @route   GET /api/comments/:courseId/:lessonId?
// @access  Public
router.get('/:courseId/:lessonId?', async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    console.log('Fetching comments for:', { courseId, lessonId, sortBy, limit });
    
    const query = {
      course: courseId,
      isDeleted: false,
      parentComment: null // Only get top-level comments
    };
    
    if (lessonId) {
      query.lesson = lessonId;
    } else {
      query.$or = [
        { lesson: { $exists: false } },
        { lesson: null }
      ]; // Course-level comments (lesson field either doesn't exist or is null)
    }
    
    console.log('Query:', JSON.stringify(query, null, 2));
    
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    
    const comments = await Comment.find(query)
      .populate('author', 'name avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name avatar'
        }
      })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Comment.countDocuments(query);
    
    console.log(`Found ${comments.length} comments out of ${total} total`);
    
    res.json({
      comments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { content, course, lesson, parentComment } = req.body;
    
    if (!content || !course) {
      return res.status(400).json({ message: 'Content and course are required' });
    }
    
    const comment = await Comment.create({
      content,
      course,
      lesson,
      parentComment,
      author: req.user._id
    });
    
    // If this is a reply, add it to parent's replies array
    if (parentComment) {
      await Comment.findByIdAndUpdate(
        parentComment,
        { $push: { replies: comment._id } }
      );
    }
    
    await comment.populate('author', 'name avatar');
    
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating comment' });
  }
});

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user owns the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }
    
    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    
    await comment.save();
    await comment.populate('author', 'name avatar');
    
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating comment' });
  }
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user owns the comment or is admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    // Soft delete
    comment.isDeleted = true;
    await comment.save();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

// @desc    Like/unlike a comment
// @route   POST /api/comments/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const existingLike = comment.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );
    
    if (existingLike) {
      // Unlike
      comment.likes = comment.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      comment.likes.push({ user: req.user._id });
    }
    
    await comment.save();
    
    res.json({
      liked: !existingLike,
      likeCount: comment.likes.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing like' });
  }
});

// @desc    Get replies for a comment
// @route   GET /api/comments/:id/replies
// @access  Public
router.get('/:id/replies', async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;
    
    const replies = await Comment.find({
      parentComment: req.params.id,
      isDeleted: false
    })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Comment.countDocuments({
      parentComment: req.params.id,
      isDeleted: false
    });
    
    res.json({
      replies,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching replies' });
  }
});

export default router;
