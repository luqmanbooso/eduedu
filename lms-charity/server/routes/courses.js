import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      level,
      featured,
      instructor,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = { isPublished: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (instructor) {
      query.instructor = instructor;
    }

    // Execute query with pagination
    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await Course.countDocuments(query);

    // Add calculated fields
    const coursesWithStats = courses.map(course => ({
      ...course,
      enrolledStudents: course.enrolledStudents.length,
      totalDuration: course.lessons.reduce((acc, lesson) => acc + lesson.duration, 0),
      totalLessons: course.lessons.length
    }));

    res.json({
      courses: coursesWithStats,
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

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate('reviews.user', 'name avatar')
      .lean();

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Add calculated fields
    course.enrolledStudents = course.enrolledStudents.length;
    course.totalDuration = course.lessons.reduce((acc, lesson) => acc + lesson.duration, 0);
    course.totalLessons = course.lessons.length;

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error fetching course',
      error: error.message 
    });
  }
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
router.post('/', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      thumbnail,
      requirements,
      learningOutcomes,
      tags
    } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      level,
      instructor: req.user._id,
      thumbnail,
      requirements: requirements || [],
      learningOutcomes: learningOutcomes || [],
      tags: tags || []
    });

    // Add course to instructor's created courses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCourses: course._id }
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name avatar');

    res.status(201).json(populatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error creating course',
      error: error.message 
    });
  }
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Course Instructor/Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'name avatar');

    res.json(updatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error updating course',
      error: error.message 
    });
  }
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Course Instructor/Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
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

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const alreadyEnrolled = course.enrolledStudents.some(
      enrollment => enrollment.student.toString() === req.user._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add student to course
    course.enrolledStudents.push({
      student: req.user._id,
      enrolledAt: new Date()
    });

    await course.save();

    // Add course to student's enrolled courses
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        enrolledCourses: {
          course: course._id,
          enrolledAt: new Date()
        }
      }
    });

    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error enrolling in course',
      error: error.message 
    });
  }
});

// @desc    Add lesson to course
// @route   POST /api/courses/:id/lessons
// @access  Private (Course Instructor/Admin)
router.post('/:id/lessons', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add lessons to this course' });
    }

    const { title, description, videoUrl, duration, resources, quiz } = req.body;

    const newLesson = {
      title,
      description,
      videoUrl,
      duration,
      order: course.lessons.length + 1,
      resources: resources || [],
      quiz: quiz || { questions: [], passingScore: 70 }
    };

    course.lessons.push(newLesson);
    await course.save();

    res.status(201).json(course.lessons[course.lessons.length - 1]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error adding lesson',
      error: error.message 
    });
  }
});

export default router;
