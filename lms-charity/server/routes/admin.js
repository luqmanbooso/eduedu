import express from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(restrictTo('admin'));

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const users = await User.find(query)
      .populate('enrolledCourses.course', 'title')
      .populate('createdCourses', 'title studentCount')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error fetching users',
      error: error.message 
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('enrolledCourses.course', 'title description instructor')
      .populate('createdCourses')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error fetching user',
      error: error.message 
    });
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive !== 'undefined') user.isActive = isActive;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error updating user',
      error: error.message 
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error deleting user',
      error: error.message 
    });
  }
});

// @desc    Get all courses (including unpublished)
// @route   GET /api/admin/courses
// @access  Private (Admin)
router.get('/courses', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isPublished,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (typeof isPublished !== 'undefined') {
      query.isPublished = isPublished === 'true';
    }

    // Execute query with pagination
    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Course.countDocuments(query);

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error fetching courses',
      error: error.message 
    });
  }
});

// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
// @access  Private (Admin)
router.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await Course.findByIdAndDelete(req.params.id);

    // Remove course from instructor's created courses
    await User.findByIdAndUpdate(course.instructor, {
      $pull: { createdCourses: req.params.id }
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error deleting course',
      error: error.message 
    });
  }
});

// @desc    Toggle course featured status
// @route   PUT /api/admin/courses/:id/featured
// @access  Private (Admin)
router.put('/courses/:id/featured', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.isFeatured = !course.isFeatured;
    await course.save();

    res.json({
      message: `Course ${course.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      isFeatured: course.isFeatured
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error updating course featured status',
      error: error.message 
    });
  }
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
router.get('/stats', async (req, res) => {
  try {
    // Get basic counts
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const publishedCourses = await Course.countDocuments({ isPublished: true });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Get course enrollments
    const enrollmentStats = await Course.aggregate([
      { $unwind: '$enrolledStudents' },
      { $group: { _id: null, totalEnrollments: { $sum: 1 } } }
    ]);

    const totalEnrollments = enrollmentStats[0]?.totalEnrollments || 0;

    // Get top categories
    const topCategories = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalCourses,
        totalStudents,
        totalInstructors,
        publishedCourses,
        totalEnrollments,
        recentUsers
      },
      topCategories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error fetching statistics',
      error: error.message 
    });
  }
});

export default router;
