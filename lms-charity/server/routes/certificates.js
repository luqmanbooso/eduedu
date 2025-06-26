import express from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create certificates directory if it doesn't exist
const certificatesDir = path.join(process.cwd(), 'uploads', 'certificates');
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

// @desc    Generate certificate for course completion
// @route   POST /api/certificates/generate
// @access  Private
router.post('/generate', protect, async (req, res) => {
  try {
    const { courseId, score } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }
    
    // Check if user has completed the course
    const course = await Course.findById(courseId).populate('instructor', 'name');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is enrolled and has completed the course
    const enrollment = course.enrolledStudents.find(
      student => student.student.toString() === req.user._id.toString()
    );
    
    if (!enrollment) {
      return res.status(400).json({ message: 'You are not enrolled in this course' });
    }
    
    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      user: req.user._id,
      course: courseId
    });
    
    if (existingCertificate) {
      return res.status(400).json({ 
        message: 'Certificate already exists for this course',
        certificate: existingCertificate
      });
    }
    
    // Determine grade based on score
    let grade = 'Pass';
    if (score >= 95) grade = 'A+';
    else if (score >= 90) grade = 'A';
    else if (score >= 85) grade = 'B+';
    else if (score >= 80) grade = 'B';
    else if (score >= 75) grade = 'C+';
    else if (score >= 70) grade = 'C';
    
    // Create certificate record
    const certificate = await Certificate.create({
      user: req.user._id,
      course: courseId,
      score: score || 100,
      grade,
      skills: course.tags || []
    });
    
    // Generate PDF certificate
    const fileName = `certificate-${certificate.certificateId}.pdf`;
    const filePath = path.join(certificatesDir, fileName);
    
    await generateCertificatePDF(certificate, course, req.user, filePath);
    
    // Update certificate with file URL
    certificate.certificateUrl = `/uploads/certificates/${fileName}`;
    await certificate.save();
    
    // Update user's certificate count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { certificatesEarned: 1 }
    });
    
    res.status(201).json({
      message: 'Certificate generated successfully',
      certificate: {
        _id: certificate._id,
        certificateId: certificate.certificateId,
        verificationCode: certificate.verificationCode,
        grade: certificate.grade,
        score: certificate.score,
        certificateUrl: certificate.certificateUrl,
        completionDate: certificate.completionDate
      }
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ message: 'Error generating certificate' });
  }
});

// @desc    Get user certificates
// @route   GET /api/certificates
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .populate('course', 'title category thumbnail')
      .sort({ completionDate: -1 });
    
    res.json(certificates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching certificates' });
  }
});

// @desc    Download certificate
// @route   GET /api/certificates/:id/download
// @access  Private
router.get('/:id/download', protect, async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('course', 'title category')
      .populate('user', 'name email');
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    // Check if user owns the certificate
    if (certificate.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const filePath = path.join(certificatesDir, `certificate-${certificate.certificateId}.pdf`);
    
    if (!fs.existsSync(filePath)) {
      // Regenerate if file doesn't exist
      await generateCertificatePDF(certificate, certificate.course, certificate.user, filePath);
    }
    
    // Mark as downloaded
    await certificate.markAsDownloaded();
    
    res.download(filePath, `${certificate.course.title}-Certificate.pdf`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error downloading certificate' });
  }
});

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:certificateId/:verificationCode
// @access  Public
router.get('/verify/:certificateId/:verificationCode', async (req, res) => {
  try {
    const { certificateId, verificationCode } = req.params;
    
    const certificate = await Certificate.verifyCertificate(certificateId, verificationCode);
    
    if (!certificate) {
      return res.status(404).json({ 
        message: 'Certificate not found or invalid verification code',
        isValid: false
      });
    }
    
    res.json({
      isValid: true,
      certificate: {
        certificateId: certificate.certificateId,
        studentName: certificate.user.name,
        courseName: certificate.course.title,
        completionDate: certificate.completionDate,
        grade: certificate.grade,
        score: certificate.score,
        skills: certificate.skills
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying certificate' });
  }
});

// @desc    Get certificate by ID (for public viewing)
// @route   GET /api/certificates/public/:certificateId
// @access  Public
router.get('/public/:certificateId', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ 
      certificateId: req.params.certificateId,
      isValid: true
    })
      .populate('user', 'name')
      .populate('course', 'title category');
    
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    res.json({
      certificateId: certificate.certificateId,
      studentName: certificate.user.name,
      courseName: certificate.course.title,
      category: certificate.course.category,
      completionDate: certificate.completionDate,
      grade: certificate.grade,
      skills: certificate.skills
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching certificate' });
  }
});

// Helper function to generate PDF certificate
async function generateCertificatePDF(certificate, course, user, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Certificate border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
         .stroke('#1e40af');
      
      doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
         .stroke('#3b82f6');
      
      // Title
      doc.fontSize(32)
         .fillColor('#1e40af')
         .text('CERTIFICATE OF COMPLETION', 60, 80, {
           width: doc.page.width - 120,
           align: 'center'
         });
      
      // Subtitle
      doc.fontSize(16)
         .fillColor('#6b7280')
         .text('This is to certify that', 60, 140, {
           width: doc.page.width - 120,
           align: 'center'
         });
      
      // Student name
      doc.fontSize(28)
         .fillColor('#1f2937')
         .text(user.name.toUpperCase(), 60, 180, {
           width: doc.page.width - 120,
           align: 'center'
         });
      
      // Course completion text
      doc.fontSize(16)
         .fillColor('#6b7280')
         .text('has successfully completed the course', 60, 230, {
           width: doc.page.width - 120,
           align: 'center'
         });
      
      // Course name
      doc.fontSize(24)
         .fillColor('#1e40af')
         .text(course.title, 60, 270, {
           width: doc.page.width - 120,
           align: 'center'
         });
      
      // Category and grade
      doc.fontSize(14)
         .fillColor('#6b7280')
         .text(`Category: ${course.category}`, 60, 320, {
           width: (doc.page.width - 120) / 2,
           align: 'center'
         })
         .text(`Grade: ${certificate.grade}`, doc.page.width / 2, 320, {
           width: (doc.page.width - 120) / 2,
           align: 'center'
         });
      
      // Completion date
      doc.fontSize(14)
         .text(`Completed on: ${certificate.completionDate.toLocaleDateString()}`, 60, 350, {
           width: doc.page.width - 120,
           align: 'center'
         });
      
      // Certificate ID and verification
      doc.fontSize(10)
         .fillColor('#9ca3af')
         .text(`Certificate ID: ${certificate.certificateId}`, 60, 420)
         .text(`Verification Code: ${certificate.verificationCode}`, 60, 435)
         .text(`Generated on: ${new Date().toLocaleDateString()}`, 60, 450);
      
      // Instructor signature (if available)
      if (course.instructor && course.instructor.name) {
        doc.fontSize(12)
           .fillColor('#1f2937')
           .text('Instructor:', doc.page.width - 200, 420)
           .text(course.instructor.name, doc.page.width - 200, 435);
      }
      
      // Verification URL
      doc.fontSize(10)
         .fillColor('#3b82f6')
         .text(`Verify at: ${process.env.CLIENT_URL}/verify-certificate/${certificate.certificateId}`, 
               60, 480, {
                 width: doc.page.width - 120,
                 align: 'center'
               });
      
      doc.end();
      
      stream.on('finish', () => {
        resolve(filePath);
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export default router;
