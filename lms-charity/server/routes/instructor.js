import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get instructor dashboard stats
// @route   GET /api/instructor/stats
// @access  Private (Instructor)
router.get('/stats', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    // Get instructor's courses
    const instructorCourses = await Course.find({ instructor: req.user._id });
    
    // Calculate stats
    const totalCourses = instructorCourses.length;
    const publishedCourses = instructorCourses.filter(course => course.isPublished).length;
    const draftCourses = totalCourses - publishedCourses;
    
    // Calculate total students (unique enrollments across all courses)
    const allEnrollments = instructorCourses.flatMap(course => 
      course.enrolledStudents.map(enrollment => enrollment.student ? enrollment.student.toString() : enrollment.toString())
    );
    const uniqueStudents = [...new Set(allEnrollments)];
    const totalStudents = uniqueStudents.length;
    
    // Calculate total revenue
    const totalRevenue = instructorCourses.reduce((sum, course) => {
      const coursePrice = course.discountPrice || course.price || 0;
      return sum + (coursePrice * course.enrolledStudents.length);
    }, 0);
    
    // Calculate average rating
    const averageRating = instructorCourses.reduce((sum, course) => {
      return sum + (course.rating ? course.rating.average || 0 : 0);
    }, 0) / (totalCourses || 1);
    
    // Calculate total certificates issued
    const certificatesIssued = instructorCourses.reduce((sum, course) => {
      return sum + course.enrolledStudents.filter(s => s.certificateIssued).length;
    }, 0);
    
    // Get recent enrollments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let recentEnrollments = 0;
    instructorCourses.forEach(course => {
      course.enrolledStudents.forEach(enrollment => {
        if (new Date(enrollment.enrolledAt) >= thirtyDaysAgo) {
          recentEnrollments++;
        }
      });
    });
    
    // Monthly earnings data (simplified for demo)
    const monthlyEarnings = [
      { month: 'Jan', earnings: totalRevenue * 0.1 },
      { month: 'Feb', earnings: totalRevenue * 0.15 },
      { month: 'Mar', earnings: totalRevenue * 0.12 },
      { month: 'Apr', earnings: totalRevenue * 0.18 },
      { month: 'May', earnings: totalRevenue * 0.22 },
      { month: 'Jun', earnings: totalRevenue * 0.23 }
    ];

    res.json({
      totalCourses,
      totalStudents,
      averageRating: Math.round(averageRating * 10) / 10,
      certificatesIssued,
      overview: {
        totalCourses,
        publishedCourses,
        draftCourses,
        totalStudents,
        totalRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        recentEnrollments,
        certificatesIssued
      },
      monthlyEarnings,
      coursesBreakdown: instructorCourses.map(course => ({
        id: course._id,
        title: course.title,
        students: course.enrolledStudents.length,
        revenue: (course.discountPrice || course.price || 0) * course.enrolledStudents.length,
        rating: course.rating ? course.rating.average || 0 : 0,
        isPublished: course.isPublished,
        status: course.status || 'draft'
      }))
    });
  } catch (error) {
    console.error('Instructor stats error:', error);
    res.status(500).json({ 
      message: 'Server error fetching instructor stats',
      error: error.message 
    });
  }
});

// @desc    Get instructor's students
// @route   GET /api/instructor/students
// @access  Private (Instructor)
router.get('/students', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    // Get instructor's courses with populated student information
    const instructorCourses = await Course.find({ instructor: req.user._id })
      .populate('enrolledStudents.student', 'name email avatar createdAt');
    
    // Collect all unique students with their progress
    const studentsMap = new Map();
    
    instructorCourses.forEach(course => {
      course.enrolledStudents.forEach(enrollment => {
        const student = enrollment.student;
        if (!student) return; // Skip if student is null
        
        const studentId = student._id.toString();
        
        if (!studentsMap.has(studentId)) {
          studentsMap.set(studentId, {
            _id: student._id,
            name: student.name,
            email: student.email,
            avatar: student.avatar,
            enrolledAt: enrollment.enrolledAt,
            courses: [],
            totalProgress: 0,
            averageProgress: 0,
            completedCourses: 0,
            totalCertificates: 0
          });
        }
        
        const studentData = studentsMap.get(studentId);
        studentData.courses.push({
          courseId: course._id,
          courseTitle: course.title,
          progress: enrollment.progress || 0,
          enrolledAt: enrollment.enrolledAt,
          lastActivity: enrollment.lastActivity,
          certificateIssued: enrollment.certificateIssued || false
        });
        
        // Update totals
        studentData.totalProgress += enrollment.progress || 0;
        if (enrollment.progress === 100) {
          studentData.completedCourses++;
        }
        if (enrollment.certificateIssued) {
          studentData.totalCertificates++;
        }
      });
    });
    
    // Convert map to array and calculate averages
    const students = Array.from(studentsMap.values()).map(student => {
      student.averageProgress = student.courses.length > 0 
        ? Math.round(student.totalProgress / student.courses.length) 
        : 0;
      return student;
    });
    
    // Sort by enrollment date (newest first)
    students.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));
    
    res.json({
      students,
      totalStudents: students.length,
      activeStudents: students.filter(s => s.averageProgress > 0).length,
      completedStudents: students.filter(s => s.completedCourses > 0).length
    });
  } catch (error) {
    console.error('Instructor students error:', error);
    res.status(500).json({ 
      message: 'Server error fetching instructor students',
      error: error.message 
    });
  }
});

export default router;
