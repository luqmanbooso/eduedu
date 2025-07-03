import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Certificate from '../models/Certificate.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { sendEmail } from '../utils/emailService.js';

const router = express.Router();

// @desc    Enroll user in a course
// @route   POST /api/enrollment/enroll/:courseId
// @access  Private
router.post('/enroll/:courseId', protect, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    // Check if course exists and is published
    const course = await Course.findById(courseId).populate('instructor', 'name email');
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course is not available for enrollment' 
      });
    }

    // Check if user is trying to enroll in their own course
    if (course.instructor._id.toString() === userId.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot enroll in your own course' 
      });
    }

    // Check if already enrolled
    const existingEnrollment = course.enrolledStudents.find(
      enrollment => enrollment.student.toString() === userId.toString()
    );

    if (existingEnrollment) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already enrolled in this course',
        enrollmentDate: existingEnrollment.enrolledAt
      });
    }

    // Check if user already has progress record (edge case cleanup)
    const existingProgress = await Progress.findOne({ user: userId, course: courseId });
    if (existingProgress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Enrollment record already exists' 
      });
    }

    // Perform enrollment transaction
    const enrollmentDate = new Date();

    // 1. Add student to course enrolled students
    course.enrolledStudents.push({
      student: userId,
      enrolledAt: enrollmentDate,
      progress: 0,
      completedLessons: [],
      certificateIssued: false
    });

    // Update course analytics
    course.analytics.enrollments += 1;
    await course.save();

    // 2. Add course to user's enrolled courses
    const user = await User.findById(userId);
    user.enrolledCourses.push({
      course: courseId,
      enrolledAt: enrollmentDate,
      progress: 0,
      completedLessons: []
    });
    await user.save();

    // 3. Create initial progress record
    const progressRecord = await Progress.create({
      user: userId,
      course: courseId,
      progressPercentage: 0,
      totalTimeSpent: 0,
      isCompleted: false,
      startedAt: enrollmentDate,
      lastAccessed: enrollmentDate
    });

    // 4. Create enrollment notification
    await Notification.create({
      recipient: userId,
      type: 'course_enrollment',
      title: 'Course Enrollment Successful',
      message: `You have successfully enrolled in "${course.title}"`,
      relatedCourse: courseId,
      actionUrl: `/courses/${courseId}/learn`
    });

    // 5. Send enrollment confirmation email
    try {
      await sendEmail({
        email: user.email,
        subject: `Welcome to ${course.title}!`,
        html: generateEnrollmentEmailHTML(user.name, course.title, course._id)
      });
    } catch (emailError) {
      console.error('Failed to send enrollment email:', emailError);
      // Don't fail the enrollment if email fails
    }

    // 6. Notify instructor about new enrollment
    try {
      await Notification.create({
        recipient: course.instructor._id,
        sender: userId,
        type: 'course_enrollment',
        title: 'New Student Enrolled',
        message: `${user.name} has enrolled in your course "${course.title}"`,
        relatedCourse: courseId,
        actionUrl: `/instructor/courses/${courseId}`
      });
    } catch (notificationError) {
      console.error('Failed to notify instructor:', notificationError);
      // Don't fail enrollment if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        enrollment: {
          courseId: course._id,
          courseTitle: course.title,
          enrolledAt: enrollmentDate,
          instructor: course.instructor.name,
          totalLessons: course.totalLessons,
          estimatedDuration: course.estimatedDuration,
          progress: {
            percentage: 0,
            completedLessons: 0,
            totalLessons: course.totalLessons
          }
        },
        nextStep: {
          action: 'start_learning',
          url: `/courses/${courseId}/learn`,
          message: 'Ready to start learning? Click here to begin your first lesson!'
        }
      }
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during enrollment',
      error: error.message 
    });
  }
});

// @desc    Get user's enrollment status for a course
// @route   GET /api/enrollment/status/:courseId
// @access  Private
router.get('/status/:courseId', protect, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Check enrollment status
    const enrollment = course.enrolledStudents.find(
      enrollment => enrollment.student.toString() === userId.toString()
    );

    if (!enrollment) {
      return res.json({
        success: true,
        data: {
          isEnrolled: false,
          canEnroll: course.isPublished && course.instructor._id.toString() !== userId.toString(),
          message: 'Not enrolled in this course'
        }
      });
    }

    // Get detailed progress
    const progress = await Progress.findOne({ user: userId, course: courseId });
    const certificate = await Certificate.findOne({ user: userId, course: courseId });

    res.json({
      success: true,
      data: {
        isEnrolled: true,
        enrolledAt: enrollment.enrolledAt,
        progress: {
          percentage: progress?.progressPercentage || 0,
          completedLessons: progress?.completedLessons?.length || 0,
          totalLessons: course.totalLessons,
          isCompleted: progress?.isCompleted || false,
          lastAccessed: progress?.lastAccessed,
          totalTimeSpent: progress?.totalTimeSpent || 0
        },
        certificate: certificate ? {
          certificateId: certificate.certificateId,
          completionDate: certificate.completionDate,
          grade: certificate.grade,
          score: certificate.score,
          downloadUrl: certificate.certificateUrl
        } : null,
        nextLesson: progress?.currentLesson,
        canContinue: true
      }
    });

  } catch (error) {
    console.error('Get enrollment status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error getting enrollment status',
      error: error.message 
    });
  }
});

// @desc    Mark lesson as completed and update progress
// @route   POST /api/enrollment/progress/:courseId/lesson/:lessonId
// @access  Private
router.post('/progress/:courseId/lesson/:lessonId', protect, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user._id;
    const { timeSpent = 0, quizScore } = req.body;

    // Verify enrollment
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrollment = course.enrolledStudents.find(
      enrollment => enrollment.student.toString() === userId.toString()
    );

    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
    }

    // Find or create progress record
    let progress = await Progress.findOne({ user: userId, course: courseId });
    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: courseId,
        progressPercentage: 0,
        totalTimeSpent: 0,
        isCompleted: false,
        startedAt: new Date(),
        lastAccessed: new Date()
      });
    }

    // Check if lesson already completed
    const existingCompletion = progress.completedLessons.find(
      completion => completion.lesson.toString() === lessonId
    );

    if (!existingCompletion) {
      // Add new lesson completion
      progress.completedLessons.push({
        lesson: lessonId,
        completedAt: new Date(),
        timeSpent: Math.max(0, parseInt(timeSpent)),
        quizScore: quizScore ? Math.min(100, Math.max(0, parseInt(quizScore))) : undefined
      });

      // Update total time spent
      progress.totalTimeSpent += Math.max(0, parseInt(timeSpent));
    } else {
      // Update existing completion (re-watching, retaking quiz)
      existingCompletion.timeSpent += Math.max(0, parseInt(timeSpent));
      if (quizScore !== undefined) {
        existingCompletion.quizScore = Math.min(100, Math.max(0, parseInt(quizScore)));
      }
      progress.totalTimeSpent += Math.max(0, parseInt(timeSpent));
    }

    // Recalculate progress
    const newProgressPercentage = await progress.calculateProgress();
    progress.lastAccessed = new Date();

    // Update streak
    const today = new Date().toDateString();
    const lastActiveDate = progress.lastActiveDate?.toDateString();
    if (lastActiveDate !== today) {
      if (lastActiveDate === new Date(Date.now() - 86400000).toDateString()) {
        progress.streakDays += 1;
      } else {
        progress.streakDays = 1;
      }
      progress.lastActiveDate = new Date();
    }

    await progress.save();

    // Update enrollment progress in course
    enrollment.progress = newProgressPercentage;
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    // Check for course completion
    const isCompleted = newProgressPercentage >= 100;
    let certificateGenerated = false;

    if (isCompleted && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      enrollment.certificateIssued = true;

      // Update user completion count
      await User.findByIdAndUpdate(userId, {
        $inc: { coursesCompleted: 1 }
      });

      // Update course analytics
      course.analytics.completions += 1;

      // Generate certificate automatically
      try {
        const certificate = await generateCourseCompletionCertificate(userId, courseId, progress);
        certificateGenerated = true;

        // Send completion notification
        await Notification.create({
          recipient: userId,
          type: 'course_completion',
          title: 'Course Completed! 🎉',
          message: `Congratulations! You've completed "${course.title}" and earned a certificate.`,
          relatedCourse: courseId,
          actionUrl: `/certificates/${certificate.certificateId}`
        });

        // Send completion email
        try {
          const user = await User.findById(userId);
          await sendEmail({
            email: user.email,
            subject: `Congratulations! You've completed ${course.title}`,
            html: generateCompletionEmailHTML(user.name, course.title, certificate.certificateId)
          });
        } catch (emailError) {
          console.error('Failed to send completion email:', emailError);
        }

      } catch (certificateError) {
        console.error('Failed to generate certificate:', certificateError);
        // Don't fail the progress update if certificate generation fails
      }
    }

    await course.save();

    res.json({
      success: true,
      message: isCompleted ? 'Congratulations! Course completed!' : 'Lesson progress updated',
      data: {
        progress: {
          percentage: newProgressPercentage,
          completedLessons: progress.completedLessons.length,
          totalLessons: course.totalLessons,
          isCompleted,
          timeSpent: progress.totalTimeSpent,
          streakDays: progress.streakDays
        },
        certificateGenerated,
        nextLesson: progress.currentLesson
      }
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating progress',
      error: error.message 
    });
  }
});

// @desc    Get user's enrolled courses with progress
// @route   GET /api/enrollment/my-courses
// @access  Private
router.get('/my-courses', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { status = 'all', limit = 10, page = 1 } = req.query;

    // Build aggregation pipeline
    const matchStage = { user: userId };
    if (status === 'completed') matchStage.isCompleted = true;
    if (status === 'in-progress') matchStage.isCompleted = false;

    const enrolledCourses = await Progress.find(matchStage)
      .populate({
        path: 'course',
        select: 'title description thumbnail instructor category level estimatedDuration isPublished',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      })
      .sort({ lastAccessed: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get certificates for completed courses
    const completedCourseIds = enrolledCourses
      .filter(enrollment => enrollment.isCompleted)
      .map(enrollment => enrollment.course._id);

    const certificates = await Certificate.find({
      user: userId,
      course: { $in: completedCourseIds }
    }).select('course certificateId grade score completionDate certificateUrl');

    const coursesWithProgress = enrolledCourses.map(enrollment => {
      const certificate = certificates.find(cert => 
        cert.course.toString() === enrollment.course._id.toString()
      );

      return {
        _id: enrollment.course._id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        thumbnail: enrollment.course.thumbnail,
        instructor: enrollment.course.instructor,
        category: enrollment.course.category,
        level: enrollment.course.level,
        estimatedDuration: enrollment.course.estimatedDuration,
        enrollment: {
          enrolledAt: enrollment.startedAt,
          lastAccessed: enrollment.lastAccessed,
          progress: {
            percentage: enrollment.progressPercentage,
            completedLessons: enrollment.completedLessons.length,
            isCompleted: enrollment.isCompleted,
            timeSpent: enrollment.totalTimeSpent,
            streakDays: enrollment.streakDays
          }
        },
        certificate: certificate ? {
          certificateId: certificate.certificateId,
          grade: certificate.grade,
          score: certificate.score,
          completionDate: certificate.completionDate,
          downloadUrl: certificate.certificateUrl
        } : null
      };
    });

    const totalEnrolled = await Progress.countDocuments({ user: userId });
    const totalCompleted = await Progress.countDocuments({ user: userId, isCompleted: true });

    res.json({
      success: true,
      data: {
        courses: coursesWithProgress,
        pagination: {
          total: totalEnrolled,
          completed: totalCompleted,
          inProgress: totalEnrolled - totalCompleted,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalEnrolled / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error getting enrolled courses',
      error: error.message 
    });
  }
});

// Helper function to generate certificate on course completion
async function generateCourseCompletionCertificate(userId, courseId, progress) {
  const course = await Course.findById(courseId).populate('instructor', 'name');
  const user = await User.findById(userId);

  // Calculate final score based on quiz scores
  const quizScores = progress.completedLessons
    .filter(lesson => lesson.quizScore !== undefined)
    .map(lesson => lesson.quizScore);
  
  const averageScore = quizScores.length > 0 
    ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length)
    : 100; // Default to 100 if no quizzes

  // Determine grade
  let grade = 'Pass';
  if (averageScore >= 95) grade = 'A+';
  else if (averageScore >= 90) grade = 'A';
  else if (averageScore >= 85) grade = 'B+';
  else if (averageScore >= 80) grade = 'B';
  else if (averageScore >= 75) grade = 'C+';
  else if (averageScore >= 70) grade = 'C';

  const certificate = await Certificate.create({
    user: userId,
    course: courseId,
    score: averageScore,
    grade,
    skills: course.tags || [],
    creditsEarned: Math.ceil(course.estimatedDuration || 1)
  });

  // Generate PDF (will be implemented in certificate route)
  // For now, just return the certificate record
  return certificate;
}

// Helper function to generate enrollment email HTML
function generateEnrollmentEmailHTML(userName, courseTitle, courseId) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px;">
        <h1 style="margin: 0; font-size: 28px;">Welcome to Your Learning Journey!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">You're now enrolled in "${courseTitle}"</p>
      </div>
      
      <div style="padding: 30px 20px; background: #f8f9fa; margin: 20px 0; border-radius: 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
        <p style="color: #666; line-height: 1.6;">
          Congratulations! You've successfully enrolled in <strong>"${courseTitle}"</strong>. 
          You're about to embark on an exciting learning adventure that will help you gain new skills and knowledge.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/courses/${courseId}/learn" 
             style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
            Start Learning Now
          </a>
        </div>
        
        <h3 style="color: #333; margin-bottom: 10px;">What's Next?</h3>
        <ul style="color: #666; line-height: 1.8;">
          <li>Access your course dashboard</li>
          <li>Start with the first lesson</li>
          <li>Track your progress</li>
          <li>Earn your completion certificate</li>
        </ul>
        
        <p style="color: #666; margin-top: 30px;">
          Happy learning!<br>
          <strong>The EduCharity Team</strong>
        </p>
      </div>
    </div>
  `;
}

// Helper function to generate completion email HTML
function generateCompletionEmailHTML(userName, courseTitle, certificateId) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white; border-radius: 10px;">
        <h1 style="margin: 0; font-size: 32px;">🎉 Congratulations!</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">Course Completed Successfully</p>
      </div>
      
      <div style="padding: 30px 20px; background: #f8f9fa; margin: 20px 0; border-radius: 10px;">
        <h2 style="color: #333; margin-top: 0;">Well done, ${userName}!</h2>
        <p style="color: #666; line-height: 1.6;">
          You've successfully completed <strong>"${courseTitle}"</strong>! 🎊
        </p>
        <p style="color: #666; line-height: 1.6;">
          This is a significant achievement and demonstrates your commitment to continuous learning and growth.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #28a745; margin-top: 0;">Your Certificate is Ready!</h3>
          <p style="color: #666; margin-bottom: 20px;">
            Certificate ID: <strong>${certificateId}</strong>
          </p>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/certificates/${certificateId}" 
               style="background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Download Certificate
            </a>
          </div>
        </div>
        
        <p style="color: #666; margin-top: 25px;">
          Keep up the excellent work and continue your learning journey!<br><br>
          <strong>The EduCharity Team</strong>
        </p>
      </div>
    </div>
  `;
}

// @desc    Get user's enrolled courses (simplified for My Learning page)
// @route   GET /api/enrollment/enrolled-courses
// @access  Private
router.get('/enrolled-courses', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all progress records with course details
    const enrolledCourses = await Progress.find({ user: userId })
      .populate({
        path: 'course',
        select: 'title description thumbnail instructor category level estimatedDuration isPublished modules',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      })
      .sort({ lastAccessed: -1 });

    // Filter out unpublished courses and format response
    const courses = enrolledCourses
      .filter(enrollment => enrollment.course && enrollment.course.isPublished)
      .map(enrollment => ({
        courseId: enrollment.course._id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        thumbnail: enrollment.course.thumbnail,
        instructor: enrollment.course.instructor,
        category: enrollment.course.category,
        level: enrollment.course.level,
        estimatedDuration: enrollment.course.estimatedDuration,
        totalLessons: enrollment.course.modules ? 
          enrollment.course.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0) : 0,
        progress: {
          percentage: enrollment.progressPercentage,
          completedLessons: enrollment.completedLessons.length,
          totalTimeSpent: enrollment.totalTimeSpent,
          lastAccessed: enrollment.lastAccessed,
          isCompleted: enrollment.isCompleted,
          currentLesson: enrollment.currentLesson
        }
      }));

    res.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enrolled courses'
    });
  }
});

// @desc    Get user's completed courses
// @route   GET /api/enrollment/completed-courses
// @access  Private
router.get('/completed-courses', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get completed courses with certificates
    const completedCourses = await Progress.find({ 
      user: userId, 
      isCompleted: true 
    })
      .populate({
        path: 'course',
        select: 'title description thumbnail instructor category level',
        populate: {
          path: 'instructor',
          select: 'name avatar'
        }
      })
      .sort({ completedAt: -1 });

    // Get certificates for completed courses
    const courseIds = completedCourses.map(c => c.course._id);
    const certificates = await Certificate.find({
      user: userId,
      course: { $in: courseIds }
    });

    const courses = completedCourses
      .filter(enrollment => enrollment.course && enrollment.course.isPublished)
      .map(enrollment => {
        const certificate = certificates.find(cert => 
          cert.course.toString() === enrollment.course._id.toString()
        );

        return {
          courseId: enrollment.course._id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          thumbnail: enrollment.course.thumbnail,
          instructor: enrollment.course.instructor,
          category: enrollment.course.category,
          level: enrollment.course.level,
          completedAt: enrollment.completedAt,
          totalTimeSpent: enrollment.totalTimeSpent,
          certificate: certificate ? {
            certificateId: certificate.certificateId,
            downloadUrl: certificate.certificateUrl,
            grade: certificate.grade,
            score: certificate.score
          } : null
        };
      });

    res.json({
      success: true,
      data: courses
    });

  } catch (error) {
    console.error('Error fetching completed courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching completed courses'
    });
  }
});

export default router;
