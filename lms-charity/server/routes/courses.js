import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { uploadVideo, uploadImage, uploadDocument, uploadAny, uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.mimetype.startsWith('image/') ? 
      path.join('uploads', 'images') : 
      path.join('uploads', 'videos');
    
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for videos
  }
});

// @desc    Upload file (video, image, document)
// @route   POST /api/courses/upload
// @access  Private (Instructor)
router.post('/upload', protect, restrictTo('instructor', 'admin'), (req, res) => {
  const { type } = req.body;
  
  let uploadMiddleware;
  switch (type) {
    case 'video':
      uploadMiddleware = uploadVideo.single('file');
      break;
    case 'image':
      uploadMiddleware = uploadImage.single('file');
      break;
    case 'document':
      uploadMiddleware = uploadDocument.single('file');
      break;
    default:
      uploadMiddleware = uploadAny.single('file');
  }
  
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: 'File upload failed',
        error: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    try {
      // Upload to Cloudinary
      const cloudinaryOptions = {
        folder: `lms-charity/${type || 'general'}`,
        resource_type: type === 'video' ? 'video' : type === 'image' ? 'image' : 'raw'
      };

      if (type === 'image') {
        cloudinaryOptions.transformation = [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' }
        ];
      }

      const uploadResult = await uploadToCloudinary(req.file.path, cloudinaryOptions);

      res.status(200).json({
        success: true,
        data: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          format: uploadResult.format,
          size: uploadResult.bytes,
          resourceType: uploadResult.resourceType,
          width: uploadResult.width,
          height: uploadResult.height,
          duration: uploadResult.duration
        }
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload to cloud storage',
        error: error.message
      });
    }
  });
});

// @desc    Upload course files (images/videos)
// @route   POST /api/courses/upload
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${
      req.file.mimetype.startsWith('image/') ? 'images' : 'videos'
    }/${req.file.filename}`;

    res.json({
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        duration: req.body.duration || null // For videos, can be set by frontend
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Server error uploading file',
      error: error.message 
    });
  }
});

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

    // Build query - only show published courses to the public
    let query = { 
      isPublished: true,
      status: 'published' 
    };

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
      totalDuration: course.modules ? course.modules.reduce((total, module) => {
        return total + (module.lessons ? module.lessons.reduce((lessonTotal, lesson) => {
          return lessonTotal + (lesson.videoDuration || 0);
        }, 0) : 0);
      }, 0) / 3600 : 0, // Convert seconds to hours
      totalLessons: course.modules ? course.modules.reduce((total, module) => {
        return total + (module.lessons ? module.lessons.length : 0);
      }, 0) : 0
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

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
router.post('/', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    console.log('=== Course Creation Request ===');
    console.log('User:', req.user?._id, req.user?.role);
    console.log('Body keys:', Object.keys(req.body));
    console.log('Title:', req.body.title);
    console.log('Category:', req.body.category);
    console.log('Level:', req.body.level);
    
    const {
      title,
      description,
      shortDescription,
      category,
      subcategory,
      level,
      thumbnail,
      previewVideo,
      tags,
      learningOutcomes,
      prerequisites,
      targetAudience,
      language,
      price,
      discountPrice,
      currency,
      estimatedDuration,
      estimatedCompletionTime,
      modules,
      certificate,
      settings,
      difficulty,
      isFeatured
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !level) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ 
        message: 'Please provide title, description, category, and level',
        received: { title: !!title, description: !!description, category: !!category, level: !!level }
      });
    }

    // Create course object with enhanced fields
    const courseData = {
      title,
      description,
      shortDescription: shortDescription || '',
      category,
      subcategory: subcategory || '',
      level,
      price: parseFloat(price) || 0,
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      currency: currency || 'USD',
      thumbnail: typeof thumbnail === 'object' ? thumbnail : {
        url: thumbnail || '',
        publicId: ''
      },
      previewVideo: typeof previewVideo === 'object' ? previewVideo : {
        url: previewVideo || '',
        publicId: '',
        duration: 0
      },
      tags: Array.isArray(tags) ? tags : [],
      learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : [],
      prerequisites: Array.isArray(prerequisites) ? prerequisites : [],
      targetAudience: Array.isArray(targetAudience) ? targetAudience : [],
      language: language || 'English',
      estimatedDuration: estimatedDuration || '',
      estimatedCompletionTime: estimatedCompletionTime || '',
      difficulty: difficulty || 'Medium',
      instructor: req.user._id,
      isFeatured: isFeatured || false,
      isPublished: false,
      status: 'draft',
      
      // Handle the new modular structure
      modules: Array.isArray(modules) ? modules.map((module, moduleIndex) => ({
        title: module.title || `Module ${moduleIndex + 1}`,
        description: module.description || '',
        estimatedDuration: parseFloat(module.estimatedDuration) || 0,
        order: module.order || moduleIndex + 1,
        lessons: Array.isArray(module.lessons) ? module.lessons.map((lesson, lessonIndex) => ({
          title: lesson.title || `Lesson ${lessonIndex + 1}`,
          description: lesson.description || '',
          type: lesson.type || 'video',
          content: lesson.content || '',
          videoUrl: lesson.videoUrl || '',
          videoDuration: parseInt(lesson.videoDuration) || 0,
          order: lesson.order || lessonIndex + 1,
          isPreview: lesson.isPreview || false,
          // Only include quiz if it has questions or if lesson type is quiz
          ...(lesson.quiz && (lesson.quiz.questions?.length > 0 || lesson.type === 'quiz') ? {
            quiz: {
              questions: lesson.quiz.questions || [],
              timeLimit: lesson.quiz.timeLimit || 30,
              passingScore: lesson.quiz.passingScore || 70,
              attemptsAllowed: lesson.quiz.attemptsAllowed || 3,
              showCorrectAnswers: lesson.quiz.showCorrectAnswers !== false
            }
          } : {}),
          // Only include assignment if it has title and description or if lesson type is assignment
          ...(lesson.assignment && lesson.assignment.title && lesson.assignment.description ? {
            assignment: {
              title: lesson.assignment.title,
              description: lesson.assignment.description,
              instructions: lesson.assignment.instructions || '',
              maxScore: lesson.assignment.maxScore || 100,
              dueDate: lesson.assignment.dueDate || null,
              submissionType: lesson.assignment.submissionType || 'both',
              allowedFormats: lesson.assignment.allowedFormats || [],
              maxFileSize: lesson.assignment.maxFileSize || (10 * 1024 * 1024)
            }
          } : {}),
          resources: Array.isArray(lesson.resources) ? lesson.resources : []
        })) : []
      })) : [],
      
      // Certificate settings
      certificate: certificate || {
        isAvailable: true,
        requirements: {
          minimumScore: 70,
          completionPercentage: 100
        }
      },
      
      // Course settings
      settings: settings || {
        allowDiscussions: true,
        allowDownloads: true,
        allowReviews: true,
        maxStudents: null,
        enrollmentDeadline: null,
        startDate: null,
        endDate: null
      },
      
      liveSessions: [],
      discussions: [],
      enrolledStudents: []
    };

    console.log('Course data prepared, creating course...');
    console.log('Modules count:', courseData.modules.length);

    // Create the course
    const course = await Course.create(courseData);
    console.log('Course created with ID:', course._id);

    // Add course to instructor's created courses
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCourses: course._id }
    });
    console.log('Added course to instructor profile');

    // Populate instructor info before sending response
    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name avatar email');

    console.log('Course creation successful');

    res.status(201).json({
      message: 'Course created successfully',
      course: populatedCourse
    });
  } catch (error) {
    console.error('=== Course Creation Error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.log('Validation errors:', messages);
      return res.status(400).json({ 
        message: 'Validation Error',
        errors: messages,
        details: error.errors
      });
    }
    
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

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'name avatar');

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Course update error:', error);
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

    // Remove course from instructor's created courses
    await User.findByIdAndUpdate(course.instructor, {
      $pull: { createdCourses: course._id }
    });

    // Remove course from students' enrolled courses
    await User.updateMany(
      { 'enrolledCourses.course': course._id },
      { $pull: { enrolledCourses: { course: course._id } } }
    );

    // Delete the course
    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Course deletion error:', error);
    res.status(500).json({ 
      message: 'Server error deleting course',
      error: error.message 
    });
  }
});

// @desc    Publish/Unpublish course
// @route   PATCH /api/courses/:id/publish
// @access  Private (Admin only)
router.patch('/:id/publish', protect, restrictTo('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Toggle published status and update course status
    if (course.isPublished) {
      course.isPublished = false;
      course.status = 'draft';
    } else {
      course.isPublished = true;
      course.status = 'published';
      course.publishedAt = new Date();
    }
    
    await course.save();

    res.json({
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      course: {
        _id: course._id,
        title: course.title,
        status: course.status,
        isPublished: course.isPublished,
        publishedAt: course.publishedAt
      }
    });
  } catch (error) {
    console.error('Course publish error:', error);
    res.status(500).json({ 
      message: 'Server error publishing course',
      error: error.message 
    });
  }
});

// @desc    Submit course for review
// @route   PATCH /api/courses/:id/submit-review
// @access  Private (Course Instructor)
router.patch('/:id/submit-review', protect, restrictTo('instructor'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is course instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit this course' });
    }

    // Validate course has required content
    if (!course.modules || course.modules.length === 0) {
      return res.status(400).json({ 
        message: 'Course must have at least one module before submitting for review' 
      });
    }

    const totalLessons = course.modules.reduce((acc, module) => 
      acc + (module.lessons ? module.lessons.length : 0), 0
    );

    if (totalLessons === 0) {
      return res.status(400).json({ 
        message: 'Course must have at least one lesson before submitting for review' 
      });
    }

    if (!course.thumbnail || !course.thumbnail.url) {
      return res.status(400).json({ 
        message: 'Course must have a thumbnail before submitting for review' 
      });
    }

    // Update status to review
    course.status = 'review';
    course.isPublished = false; // Ensure it's not published until approved
    await course.save();

    // Create notification for admins
    const Notification = (await import('../models/Notification.js')).default;
    const admins = await User.find({ role: 'admin' });
    
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'New Course Pending Review',
        message: `"${course.title}" by ${req.user.name} has been submitted for review.`,
        type: 'admin_alert',
        relatedCourse: course._id
      });
    }

    res.json({
      message: 'Course submitted for review successfully',
      course: {
        _id: course._id,
        title: course.title,
        status: course.status,
        isPublished: course.isPublished
      }
    });
  } catch (error) {
    console.error('Course submit review error:', error);
    res.status(500).json({ 
      message: 'Server error submitting course for review',
      error: error.message 
    });
  }
});

// @desc    Get instructor's courses
// @route   GET /api/courses/instructor/my-courses
// @access  Private (Instructor)
router.get('/instructor/my-courses', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .populate('instructor', 'name avatar')
      .sort({ createdAt: -1 });

    // Add calculated fields
    const coursesWithStats = courses.map(course => ({
      ...course.toObject(),
      totalStudents: course.enrolledStudents.length,
      totalModules: course.modules.length,
      totalLessons: course.modules.reduce((acc, module) => acc + (module.lessons ? module.lessons.length : 0), 0),
      averageRating: course.rating ? course.rating.average || 0 : 0,
      totalRatings: course.rating ? course.rating.count || 0 : 0
    }));

    res.json({
      courses: coursesWithStats,
      total: courses.length
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({ 
      message: 'Server error fetching instructor courses',
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
    course.totalDuration = course.modules ? course.modules.reduce((total, module) => {
      return total + (module.lessons ? module.lessons.reduce((lessonTotal, lesson) => {
        return lessonTotal + (lesson.videoDuration || 0);
      }, 0) : 0);
    }, 0) / 3600 : 0; // Convert seconds to hours
    course.totalLessons = course.modules ? course.modules.reduce((total, module) => {
      return total + (module.lessons ? module.lessons.length : 0);
    }, 0) : 0;

    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error fetching course',
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

// @desc    Add lesson to course (DEPRECATED - Use module-based lessons instead)
// @route   POST /api/courses/:id/lessons
// @access  Private (Course Instructor/Admin)
/* 
router.post('/:id/lessons', protect, async (req, res) => {
  try {
    // This route is deprecated - use module-based structure instead
    res.status(410).json({ 
      message: 'This endpoint is deprecated. Please use module-based lesson creation: POST /api/courses/:courseId/modules/:moduleId/lessons'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Server error adding lesson',
      error: error.message 
    });
  }
});
*/

// @desc    Add module to course
// @route   POST /api/courses/:id/modules
// @access  Private (Course Instructor/Admin)
router.post('/:id/modules', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is course instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this course' });
    }

    const {
      title,
      description,
      estimatedDuration,
      prerequisites,
      learningObjectives
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Module title is required' });
    }

    // Calculate order
    const order = course.modules.length + 1;

    const newModule = {
      title,
      description: description || '',
      order,
      estimatedDuration: estimatedDuration || 0,
      prerequisites: prerequisites || [],
      learningObjectives: learningObjectives || [],
      lessons: []
    };

    course.modules.push(newModule);
    await course.save();

    const createdModule = course.modules[course.modules.length - 1];

    res.status(201).json({
      message: 'Module added successfully',
      module: createdModule
    });
  } catch (error) {
    console.error('Module creation error:', error);
    res.status(500).json({ 
      message: 'Server error creating module',
      error: error.message 
    });
  }
});

// @desc    Update module
// @route   PUT /api/courses/:courseId/modules/:moduleId
// @access  Private (Course Instructor/Admin)
router.put('/:courseId/modules/:moduleId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this course' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Update module fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        module[key] = req.body[key];
      }
    });

    await course.save();

    res.json({
      message: 'Module updated successfully',
      module
    });
  } catch (error) {
    console.error('Module update error:', error);
    res.status(500).json({ 
      message: 'Server error updating module',
      error: error.message 
    });
  }
});

// @desc    Delete module
// @route   DELETE /api/courses/:courseId/modules/:moduleId
// @access  Private (Course Instructor/Admin)
router.delete('/:courseId/modules/:moduleId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this course' });
    }

    const moduleIndex = course.modules.findIndex(m => m._id.toString() === req.params.moduleId);
    if (moduleIndex === -1) {
      return res.status(404).json({ message: 'Module not found' });
    }

    course.modules.splice(moduleIndex, 1);
    await course.save();

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Module deletion error:', error);
    res.status(500).json({ 
      message: 'Server error deleting module',
      error: error.message 
    });
  }
});

// @desc    Add lesson to module
// @route   POST /api/courses/:courseId/modules/:moduleId/lessons
// @access  Private (Course Instructor/Admin)
router.post('/:courseId/modules/:moduleId/lessons', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this course' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const {
      title,
      description,
      content,
      videoUrl,
      videoDuration,
      videoPublicId,
      type,
      resources,
      quiz,
      assignment,
      isPreview
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ message: 'Lesson title and description are required' });
    }

    // Calculate order
    const order = module.lessons.length + 1;

    const newLesson = {
      title,
      description,
      content: content || '',
      videoUrl: videoUrl || '',
      videoDuration: videoDuration || 0,
      videoPublicId: videoPublicId || '',
      order,
      type: type || 'video',
      resources: resources || [],
      quiz: quiz || {
        questions: [],
        timeLimit: null,
        attemptsAllowed: 3,
        passingScore: 70,
        showCorrectAnswers: true
      },
      assignment: assignment || null,
      isPreview: isPreview || false,
      isPublished: false
    };

    module.lessons.push(newLesson);
    await course.save();

    const createdLesson = module.lessons[module.lessons.length - 1];

    res.status(201).json({
      message: 'Lesson added successfully',
      lesson: createdLesson
    });
  } catch (error) {
    console.error('Lesson creation error:', error);
    res.status(500).json({ 
      message: 'Server error creating lesson',
      error: error.message 
    });
  }
});

// @desc    Update lesson
// @route   PUT /api/courses/:courseId/modules/:moduleId/lessons/:lessonId
// @access  Private (Course Instructor/Admin)
router.put('/:courseId/modules/:moduleId/lessons/:lessonId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this course' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const lesson = module.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Update lesson fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        lesson[key] = req.body[key];
      }
    });

    await course.save();

    res.json({
      message: 'Lesson updated successfully',
      lesson
    });
  } catch (error) {
    console.error('Lesson update error:', error);
    res.status(500).json({ 
      message: 'Server error updating lesson',
      error: error.message 
    });
  }
});

// @desc    Delete lesson
// @route   DELETE /api/courses/:courseId/modules/:moduleId/lessons/:lessonId
// @access  Private (Course Instructor/Admin)
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this course' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const lessonIndex = module.lessons.findIndex(l => l._id.toString() === req.params.lessonId);
    if (lessonIndex === -1) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    module.lessons.splice(lessonIndex, 1);
    await course.save();

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Lesson deletion error:', error);
    res.status(500).json({ 
      message: 'Server error deleting lesson',
      error: error.message 
    });
  }
});

// @desc    Schedule live session
// @route   POST /api/courses/:id/live-sessions
// @access  Private (Course Instructor/Admin)
router.post('/:id/live-sessions', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to schedule sessions for this course' });
    }

    const {
      title,
      description,
      scheduledAt,
      duration,
      meetingUrl,
      meetingId,
      meetingPassword
    } = req.body;

    // Validate required fields
    if (!title || !scheduledAt || !duration) {
      return res.status(400).json({ message: 'Title, scheduled time, and duration are required' });
    }

    const liveSession = {
      title,
      description: description || '',
      scheduledAt: new Date(scheduledAt),
      duration,
      meetingUrl: meetingUrl || '',
      meetingId: meetingId || '',
      meetingPassword: meetingPassword || '',
      status: 'scheduled',
      attendees: []
    };

    course.liveSessions.push(liveSession);
    await course.save();

    const createdSession = course.liveSessions[course.liveSessions.length - 1];

    res.status(201).json({
      message: 'Live session scheduled successfully',
      session: createdSession
    });
  } catch (error) {
    console.error('Live session creation error:', error);
    res.status(500).json({ 
      message: 'Server error scheduling live session',
      error: error.message 
    });
  }
});

// @desc    Update live session status
// @route   PUT /api/courses/:courseId/live-sessions/:sessionId
// @access  Private (Course Instructor/Admin)
router.put('/:courseId/live-sessions/:sessionId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this session' });
    }

    const session = course.liveSessions.id(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Live session not found' });
    }

    // Update session fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        session[key] = req.body[key];
      }
    });

    await course.save();

    res.json({
      message: 'Live session updated successfully',
      session
    });
  } catch (error) {
    console.error('Live session update error:', error);
    res.status(500).json({ 
      message: 'Server error updating live session',
      error: error.message 
    });
  }
});

// @desc    Create discussion topic
// @route   POST /api/courses/:id/discussions
// @access  Private (Enrolled Student/Course Instructor/Admin)
router.post('/:id/discussions', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled, instructor, or admin
    const isEnrolled = course.enrolledStudents.some(
      enrollment => enrollment.student.toString() === req.user._id.toString()
    );
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isEnrolled && !isInstructor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to create discussions in this course' });
    }

    const {
      title,
      content,
      category
    } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const discussion = {
      title,
      content,
      category: category || 'general',
      author: req.user._id,
      isPinned: false,
      replies: [],
      likes: [],
      views: 0
    };

    course.discussions.push(discussion);
    await course.save();

    // Populate author info
    await course.populate('discussions.author', 'name avatar');

    const createdDiscussion = course.discussions[course.discussions.length - 1];

    res.status(201).json({
      message: 'Discussion created successfully',
      discussion: createdDiscussion
    });
  } catch (error) {
    console.error('Discussion creation error:', error);
    res.status(500).json({ 
      message: 'Server error creating discussion',
      error: error.message 
    });
  }
});

// @desc    Reply to discussion
// @route   POST /api/courses/:courseId/discussions/:discussionId/replies
// @access  Private (Enrolled Student/Course Instructor/Admin)
router.post('/:courseId/discussions/:discussionId/replies', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization
    const isEnrolled = course.enrolledStudents.some(
      enrollment => enrollment.student.toString() === req.user._id.toString()
    );
    const isInstructor = course.instructor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isEnrolled && !isInstructor && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to reply to discussions in this course' });
    }

    const discussion = course.discussions.id(req.params.discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    const reply = {
      content,
      author: req.user._id,
      createdAt: new Date(),
      likes: []
    };

    discussion.replies.push(reply);
    await course.save();

    // Populate author info
    await course.populate('discussions.replies.author', 'name avatar');

    const createdReply = discussion.replies[discussion.replies.length - 1];

    res.status(201).json({
      message: 'Reply added successfully',
      reply: createdReply
    });
  } catch (error) {
    console.error('Reply creation error:', error);
    res.status(500).json({ 
      message: 'Server error adding reply',
      error: error.message 
    });
  }
});

// @desc    Publish/Unpublish course
// @route   PUT /api/courses/:id/publish
// @access  Private (Course Instructor/Admin)
router.put('/:id/publish', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to publish this course' });
    }

    const { isPublished } = req.body;

    course.isPublished = isPublished;
    course.status = isPublished ? 'published' : 'draft';
    if (isPublished && !course.publishedAt) {
      course.publishedAt = new Date();
    }

    await course.save();

    res.json({
      message: `Course ${isPublished ? 'published' : 'unpublished'} successfully`,
      course: {
        _id: course._id,
        title: course.title,
        isPublished: course.isPublished,
        status: course.status,
        publishedAt: course.publishedAt
      }
    });
  } catch (error) {
    console.error('Course publish error:', error);
    res.status(500).json({ 
      message: 'Server error publishing course',
      error: error.message 
    });
  }
});

// @desc    Get course analytics
// @route   GET /api/courses/:id/analytics
// @access  Private (Course Instructor/Admin)
router.get('/:id/analytics', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents.student', 'name email avatar createdAt');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view analytics for this course' });
    }

    // Calculate analytics
    const totalStudents = course.enrolledStudents.length;
    const completedStudents = course.enrolledStudents.filter(s => s.progress === 100).length;
    const averageProgress = totalStudents > 0 
      ? course.enrolledStudents.reduce((acc, s) => acc + s.progress, 0) / totalStudents 
      : 0;

    // Monthly enrollment data
    const monthlyEnrollments = {};
    course.enrolledStudents.forEach(enrollment => {
      const month = new Date(enrollment.enrolledAt).toISOString().slice(0, 7);
      monthlyEnrollments[month] = (monthlyEnrollments[month] || 0) + 1;
    });

    // Progress distribution
    const progressRanges = {
      '0-25': 0,
      '26-50': 0,
      '51-75': 0,
      '76-100': 0
    };

    course.enrolledStudents.forEach(student => {
      const progress = student.progress;
      if (progress <= 25) progressRanges['0-25']++;
      else if (progress <= 50) progressRanges['26-50']++;
      else if (progress <= 75) progressRanges['51-75']++;
      else progressRanges['76-100']++;
    });

    const analytics = {
      overview: {
        totalStudents,
        completedStudents,
        completionRate: totalStudents > 0 ? (completedStudents / totalStudents * 100).toFixed(1) : 0,
        averageProgress: averageProgress.toFixed(1),
        totalRating: course.rating.average || 0,
        totalReviews: course.rating.count || 0,
        totalRevenue: totalStudents * (course.discountPrice || course.price || 0)
      },
      enrollments: {
        monthly: monthlyEnrollments,
        recent: course.enrolledStudents
          .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
          .slice(0, 10)
      },
      progress: {
        distribution: progressRanges,
        details: course.enrolledStudents.map(s => ({
          student: s.student,
          progress: s.progress,
          lastActivity: s.lastActivity,
          completedLessons: s.completedLessons.length
        }))
      },
      engagement: {
        totalDiscussions: course.discussions.length,
        activeSessions: course.liveSessions.filter(s => s.status === 'scheduled').length,
        completedSessions: course.liveSessions.filter(s => s.status === 'completed').length
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Course analytics error:', error);
    res.status(500).json({ 
      message: 'Server error fetching course analytics',
      error: error.message 
    });
  }
});

export default router;
