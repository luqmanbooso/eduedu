import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('enrolledCourses.course', 'title thumbnail category level')
      .populate('createdCourses', 'title thumbnail category level studentCount');
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    const {
      name,
      bio,
      skills,
      location,
      phoneNumber,
      dateOfBirth,
      socialLinks
    } = req.body;
    
    const updateFields = {};
    
    if (name) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (skills) updateFields.skills = skills;
    if (location !== undefined) updateFields.location = location;
    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
    if (dateOfBirth) updateFields.dateOfBirth = new Date(dateOfBirth);
    if (socialLinks) updateFields.socialLinks = socialLinks;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// @desc    Update user avatar
// @route   PUT /api/profile/avatar
// @access  Private
router.put('/avatar', protect, async (req, res) => {
  try {
    const { avatar } = req.body;
    
    if (!avatar) {
      return res.status(400).json({ message: 'Avatar URL is required' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true }
    ).select('-password');
    
    res.json({
      message: 'Avatar updated successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating avatar' });
  }
});

// @desc    Update user preferences
// @route   PUT /api/profile/preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({ message: 'Preferences are required' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences },
      { new: true }
    ).select('preferences');
    
    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating preferences' });
  }
});

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// @desc    Get public profile by user ID
// @route   GET /api/profile/public/:userId
// @access  Public
router.get('/public/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name avatar bio skills location socialLinks role createdCourses totalLearningTime certificatesEarned coursesCompleted createdAt')
      .populate('createdCourses', 'title thumbnail category level rating.average studentCount');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching public profile' });
  }
});

// @desc    Search users
// @route   GET /api/profile/search
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q, role, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const query = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { skills: { $in: [new RegExp(q, 'i')] } }
      ],
      isActive: true
    };
    
    if (role) {
      query.role = role;
    }
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('name avatar bio skills location role totalLearningTime certificatesEarned')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error searching users' });
  }
});

// @desc    Get user statistics
// @route   GET /api/profile/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses.course', 'title category')
      .populate('createdCourses', 'title enrolledStudents rating.average');
    
    // Calculate stats
    const enrolledCoursesCount = user.enrolledCourses.length;
    const createdCoursesCount = user.createdCourses.length;
    
    // Calculate average course rating for instructors
    let averageInstructorRating = 0;
    if (user.role === 'instructor' && createdCoursesCount > 0) {
      const totalRating = user.createdCourses.reduce((sum, course) => sum + course.rating.average, 0);
      averageInstructorRating = totalRating / createdCoursesCount;
    }
    
    // Calculate total students taught (for instructors)
    let totalStudentsTaught = 0;
    if (user.role === 'instructor') {
      totalStudentsTaught = user.createdCourses.reduce((sum, course) => sum + course.enrolledStudents.length, 0);
    }
    
    // Learning categories for students
    const learningCategories = {};
    if (user.role === 'student') {
      user.enrolledCourses.forEach(enrollment => {
        const category = enrollment.course.category;
        learningCategories[category] = (learningCategories[category] || 0) + 1;
      });
    }
    
    res.json({
      general: {
        totalLearningTime: user.totalLearningTime,
        certificatesEarned: user.certificatesEarned,
        coursesCompleted: user.coursesCompleted,
        memberSince: user.createdAt
      },
      courses: {
        enrolled: enrolledCoursesCount,
        created: createdCoursesCount
      },
      instructor: user.role === 'instructor' ? {
        averageRating: Math.round(averageInstructorRating * 10) / 10,
        totalStudentsTaught,
        coursesCreated: createdCoursesCount
      } : null,
      student: user.role === 'student' ? {
        learningCategories,
        enrolledCourses: enrolledCoursesCount
      } : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user statistics' });
  }
});

// @desc    Deactivate account
// @route   PUT /api/profile/deactivate
// @access  Private
router.put('/deactivate', protect, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required to deactivate account' });
    }
    
    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }
    
    // Deactivate account
    user.isActive = false;
    await user.save();
    
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deactivating account' });
  }
});

export default router;
