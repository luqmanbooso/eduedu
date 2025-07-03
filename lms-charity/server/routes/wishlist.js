import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Add course to wishlist
// @route   POST /api/wishlist/add/:courseId
// @access  Private
router.post('/add/:courseId', protect, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already in wishlist
    const user = await User.findById(userId);
    if (user.wishlist && user.wishlist.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Course already in wishlist'
      });
    }

    // Add to wishlist
    await User.findByIdAndUpdate(userId, {
      $addToSet: { wishlist: courseId }
    });

    res.json({
      success: true,
      message: 'Course added to wishlist'
    });

  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding course to wishlist'
    });
  }
});

// @desc    Remove course from wishlist
// @route   DELETE /api/wishlist/remove/:courseId
// @access  Private
router.delete('/remove/:courseId', protect, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    // Remove from wishlist
    await User.findByIdAndUpdate(userId, {
      $pull: { wishlist: courseId }
    });

    res.json({
      success: true,
      message: 'Course removed from wishlist'
    });

  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing course from wishlist'
    });
  }
});

// @desc    Get user's wishlist courses
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: 'wishlist',
      select: 'title description thumbnail instructor category level price rating',
      populate: {
        path: 'instructor',
        select: 'name avatar'
      }
    });

    const wishlistCourses = user.wishlist || [];

    res.json({
      success: true,
      data: wishlistCourses.map(course => ({
        courseId: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        category: course.category,
        level: course.level,
        price: course.price,
        rating: course.rating
      }))
    });

  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist'
    });
  }
});

// @desc    Check if course is in wishlist
// @route   GET /api/wishlist/check/:courseId
// @access  Private
router.get('/check/:courseId', protect, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    const user = await User.findById(userId).select('wishlist');
    const isInWishlist = user.wishlist && user.wishlist.includes(courseId);

    res.json({
      success: true,
      isInWishlist
    });

  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking wishlist',
      isInWishlist: false
    });
  }
});

export default router;
