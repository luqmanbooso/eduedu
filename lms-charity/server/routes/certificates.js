import express from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
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
    
    // Verify course completion through Progress model
    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
      isCompleted: true
    });
    
    if (!progress) {
      return res.status(400).json({ 
        message: 'You must complete the course before generating a certificate' 
      });
    }
    
    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      user: req.user._id,
      course: courseId
    });
    
    if (existingCertificate) {
      return res.status(200).json({ 
        message: 'Certificate already exists',
        certificate: {
          _id: existingCertificate._id,
          certificateId: existingCertificate.certificateId,
          verificationCode: existingCertificate.verificationCode,
          grade: existingCertificate.grade,
          score: existingCertificate.score,
          certificateUrl: existingCertificate.certificateUrl,
          completionDate: existingCertificate.completionDate
        }
      });
    }
    
    // Calculate final score from quiz scores in progress
    const quizScores = progress.completedLessons
      .filter(lesson => lesson.quizScore !== undefined)
      .map(lesson => lesson.quizScore);
    
    const finalScore = score || (quizScores.length > 0 
      ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length)
      : 100);
    
    // Determine grade based on score
    let grade = 'Pass';
    if (finalScore >= 95) grade = 'A+';
    else if (finalScore >= 90) grade = 'A';
    else if (finalScore >= 85) grade = 'B+';
    else if (finalScore >= 80) grade = 'B';
    else if (finalScore >= 75) grade = 'C+';
    else if (finalScore >= 70) grade = 'C';
    
    // Create certificate record
    const certificate = await Certificate.create({
      user: req.user._id,
      course: courseId,
      score: finalScore,
      grade,
      skills: course.tags || [],
      creditsEarned: Math.ceil(course.estimatedDuration || 1),
      completionDate: progress.completedAt || new Date()
    });
    
    // Generate PDF certificate with modern design
    const fileName = `certificate-${certificate.certificateId}.pdf`;
    const filePath = path.join(certificatesDir, fileName);
    
    await generateModernCertificatePDF(certificate, course, req.user, filePath);
    
    // Update certificate with file URL
    certificate.certificateUrl = `/uploads/certificates/${fileName}`;
    await certificate.save();
    
    // Update user's certificate count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { certificatesEarned: 1 }
    });
    
    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      certificate: {
        _id: certificate._id,
        certificateId: certificate.certificateId,
        verificationCode: certificate.verificationCode,
        grade: certificate.grade,
        score: certificate.score,
        certificateUrl: certificate.certificateUrl,
        completionDate: certificate.completionDate,
        skills: certificate.skills,
        creditsEarned: certificate.creditsEarned
      }
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ message: 'Error generating certificate' });
  }
});

// @desc    Get user's certificates
// @route   GET /api/certificates/my-certificates
// @access  Private
router.get('/my-certificates', protect, async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .populate('course', 'title instructor category estimatedDuration')
      .populate('course.instructor', 'name')
      .sort({ completionDate: -1 });

    const certificatesWithStats = certificates.map(cert => ({
      _id: cert._id,
      certificateId: cert.certificateId,
      verificationCode: cert.verificationCode,
      completionDate: cert.completionDate,
      grade: cert.grade,
      score: cert.score,
      skills: cert.skills,
      creditsEarned: cert.creditsEarned,
      downloadCount: cert.downloadCount,
      course: {
        title: cert.course.title,
        instructor: cert.course.instructor?.name || 'Unknown',
        category: cert.course.category,
        duration: cert.course.estimatedDuration
      },
      certificateUrl: cert.certificateUrl,
      verificationUrl: `${process.env.FRONTEND_URL}/verify-certificate/${cert.certificateId}/${cert.verificationCode}`
    }));

    res.json({
      success: true,
      data: {
        certificates: certificatesWithStats,
        totalCertificates: certificates.length,
        totalCredits: certificates.reduce((sum, cert) => sum + (cert.creditsEarned || 0), 0)
      }
    });

  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error getting certificates',
      error: error.message 
    });
  }
});

// @desc    Download certificate PDF
// @route   GET /api/certificates/download/:certificateId
// @access  Private
router.get('/download/:certificateId', protect, async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ 
      certificateId: req.params.certificateId,
      user: req.user._id 
    }).populate('course', 'title instructor').populate('course.instructor', 'name');

    if (!certificate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Certificate not found' 
      });
    }

    const filePath = path.join(certificatesDir, `certificate-${certificate.certificateId}.pdf`);
    
    // Check if file exists, if not regenerate it
    if (!fs.existsSync(filePath)) {
      const user = await User.findById(req.user._id);
      await generateModernCertificatePDF(certificate, certificate.course, user, filePath);
    }

    // Update download count
    await certificate.markAsDownloaded();

    // Send file
    res.download(filePath, `${certificate.course.title} - Certificate.pdf`, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ 
          success: false, 
          message: 'Error downloading certificate' 
        });
      }
    });

  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error downloading certificate',
      error: error.message 
    });
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
        success: false, 
        message: 'Certificate not found or invalid' 
      });
    }

    res.json({
      success: true,
      message: 'Certificate is valid',
      data: {
        certificateId: certificate.certificateId,
        studentName: certificate.user.name,
        studentEmail: certificate.user.email,
        courseTitle: certificate.course.title,
        completionDate: certificate.completionDate,
        grade: certificate.grade,
        score: certificate.score,
        skills: certificate.skills,
        creditsEarned: certificate.creditsEarned,
        issuedDate: certificate.createdAt,
        isValid: certificate.isValid,
        expiryDate: certificate.expiryDate
      }
    });

  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error verifying certificate',
      error: error.message 
    });
  }
});

// @desc    Get certificate preview data
// @route   GET /api/certificates/preview/:certificateId
// @access  Private
router.get('/preview/:certificateId', protect, async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId,
      user: req.user._id
    }).populate('course', 'title instructor category estimatedDuration')
      .populate('course.instructor', 'name');

    if (!certificate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Certificate not found' 
      });
    }

    res.json({
      success: true,
      data: {
        certificateId: certificate.certificateId,
        verificationCode: certificate.verificationCode,
        studentName: req.user.name,
        courseTitle: certificate.course.title,
        instructorName: certificate.course.instructor?.name || 'EduCharity',
        completionDate: certificate.completionDate,
        grade: certificate.grade,
        score: certificate.score,
        skills: certificate.skills,
        creditsEarned: certificate.creditsEarned,
        category: certificate.course.category,
        duration: certificate.course.estimatedDuration,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-certificate/${certificate.certificateId}/${certificate.verificationCode}`
      }
    });

  } catch (error) {
    console.error('Get certificate preview error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error getting certificate preview',
      error: error.message 
    });
  }
});

// Modern Udemy-like Certificate PDF Generation
async function generateModernCertificatePDF(certificate, course, user, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 50, right: 50 }
      });

      // Create write stream
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Page dimensions
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const centerX = pageWidth / 2;

      // Colors (Udemy-like palette)
      const primaryColor = '#6366f1';      // Indigo
      const secondaryColor = '#f59e0b';    // Amber
      const darkColor = '#1f2937';        // Dark gray
      const lightColor = '#f3f4f6';       // Light gray
      const whiteColor = '#ffffff';

      // Background
      doc.rect(0, 0, pageWidth, pageHeight)
         .fill(whiteColor);

      // Top border with gradient effect (simulated with rectangles)
      for (let i = 0; i < 10; i++) {
        const opacity = 0.8 - (i * 0.08);
        doc.rect(0, i * 3, pageWidth, 3)
           .fillOpacity(opacity)
           .fill(primaryColor);
      }

      // Bottom border
      for (let i = 0; i < 10; i++) {
        const opacity = 0.8 - (i * 0.08);
        doc.rect(0, pageHeight - 30 + (i * 3), pageWidth, 3)
           .fillOpacity(opacity)
           .fill(secondaryColor);
      }

      // Reset opacity
      doc.fillOpacity(1);

      // Logo/Brand area (top left)
      doc.fontSize(28)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text('EduCharity', 50, 50);

      doc.fontSize(12)
         .fillColor(darkColor)
         .font('Helvetica')
         .text('Certificate of Completion', 50, 80);

      // Certificate ID (top right)
      doc.fontSize(10)
         .fillColor(darkColor)
         .font('Helvetica')
         .text(`Certificate ID: ${certificate.certificateId}`, pageWidth - 250, 50)
         .text(`Verification Code: ${certificate.verificationCode}`, pageWidth - 250, 65)
         .text(`Date: ${certificate.completionDate.toLocaleDateString()}`, pageWidth - 250, 80);

      // Main title
      doc.fontSize(36)
         .fillColor(darkColor)
         .font('Helvetica-Bold')
         .text('Certificate of Achievement', centerX, 140, { align: 'center' });

      // Decorative line
      doc.moveTo(centerX - 150, 190)
         .lineTo(centerX + 150, 190)
         .strokeColor(secondaryColor)
         .lineWidth(3)
         .stroke();

      // "This is to certify that" text
      doc.fontSize(16)
         .fillColor(darkColor)
         .font('Helvetica')
         .text('This is to certify that', centerX, 220, { align: 'center' });

      // Student name (highlighted)
      doc.fontSize(32)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text(user.name.toUpperCase(), centerX, 260, { align: 'center' });

      // "has successfully completed" text
      doc.fontSize(16)
         .fillColor(darkColor)
         .font('Helvetica')
         .text('has successfully completed the course', centerX, 310, { align: 'center' });

      // Course title (highlighted)
      doc.fontSize(24)
         .fillColor(secondaryColor)
         .font('Helvetica-Bold')
         .text(course.title, centerX, 340, { align: 'center', width: 600 });

      // Performance details
      const performanceY = 400;
      
      // Create performance boxes
      const boxWidth = 120;
      const boxHeight = 60;
      const spacing = 40;
      const startX = centerX - (boxWidth * 1.5 + spacing);

      // Grade box
      doc.rect(startX, performanceY, boxWidth, boxHeight)
         .fillColor(lightColor)
         .fill()
         .rect(startX, performanceY, boxWidth, boxHeight)
         .strokeColor(primaryColor)
         .lineWidth(2)
         .stroke();

      doc.fontSize(14)
         .fillColor(darkColor)
         .font('Helvetica')
         .text('Grade', startX, performanceY + 15, { width: boxWidth, align: 'center' });

      doc.fontSize(20)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text(certificate.grade, startX, performanceY + 35, { width: boxWidth, align: 'center' });

      // Score box
      const scoreX = startX + boxWidth + spacing;
      doc.rect(scoreX, performanceY, boxWidth, boxHeight)
         .fillColor(lightColor)
         .fill()
         .rect(scoreX, performanceY, boxWidth, boxHeight)
         .strokeColor(secondaryColor)
         .lineWidth(2)
         .stroke();

      doc.fontSize(14)
         .fillColor(darkColor)
         .font('Helvetica')
         .text('Score', scoreX, performanceY + 15, { width: boxWidth, align: 'center' });

      doc.fontSize(20)
         .fillColor(secondaryColor)
         .font('Helvetica-Bold')
         .text(`${certificate.score}%`, scoreX, performanceY + 35, { width: boxWidth, align: 'center' });

      // Credits box
      const creditsX = scoreX + boxWidth + spacing;
      doc.rect(creditsX, performanceY, boxWidth, boxHeight)
         .fillColor(lightColor)
         .fill()
         .rect(creditsX, performanceY, boxWidth, boxHeight)
         .strokeColor(primaryColor)
         .lineWidth(2)
         .stroke();

      doc.fontSize(14)
         .fillColor(darkColor)
         .font('Helvetica')
         .text('Credits', creditsX, performanceY + 15, { width: boxWidth, align: 'center' });

      doc.fontSize(20)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text(`${certificate.creditsEarned || 1}`, creditsX, performanceY + 35, { width: boxWidth, align: 'center' });

      // Skills section (if available)
      if (certificate.skills && certificate.skills.length > 0) {
        doc.fontSize(14)
           .fillColor(darkColor)
           .font('Helvetica-Bold')
           .text('Skills Acquired:', centerX, 490, { align: 'center' });

        doc.fontSize(12)
           .fillColor(darkColor)
           .font('Helvetica')
           .text(certificate.skills.join(' • '), centerX, 510, { 
             align: 'center', 
             width: 500 
           });
      }

      // Instructor signature area
      const signatureY = pageHeight - 140;
      
      // Instructor info
      doc.fontSize(12)
         .fillColor(darkColor)
         .font('Helvetica')
         .text('Instructor', 100, signatureY);

      doc.fontSize(16)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text(course.instructor?.name || 'EduCharity Team', 100, signatureY + 20);

      // Signature line
      doc.moveTo(80, signatureY + 50)
         .lineTo(250, signatureY + 50)
         .strokeColor(darkColor)
         .lineWidth(1)
         .stroke();

      // Platform verification
      doc.fontSize(12)
         .fillColor(darkColor)
         .font('Helvetica')
         .text('Verified by EduCharity', pageWidth - 200, signatureY);

      doc.fontSize(10)
         .fillColor(darkColor)
         .font('Helvetica')
         .text(`Verify at: ${process.env.FRONTEND_URL}/verify-certificate/${certificate.certificateId}/${certificate.verificationCode}`, 
                pageWidth - 350, signatureY + 20, { width: 300 });

      // Verification QR code placeholder (could integrate QR library)
      doc.rect(pageWidth - 100, signatureY + 40, 60, 60)
         .strokeColor(lightColor)
         .lineWidth(1)
         .stroke();

      doc.fontSize(8)
         .fillColor(darkColor)
         .font('Helvetica')
         .text('QR Code', pageWidth - 85, signatureY + 68, { align: 'center' });

      // Decorative elements
      // Add some decorative circles
      for (let i = 0; i < 3; i++) {
        const x = 100 + (i * 150);
        const y = 150;
        doc.circle(x, y, 3)
           .fillColor(secondaryColor)
           .fillOpacity(0.3)
           .fill();
      }

      doc.fillOpacity(1);

      // Footer
      doc.fontSize(8)
         .fillColor(darkColor)
         .font('Helvetica')
         .text('This certificate is electronically generated and verified. No signature is required.', 
                centerX, pageHeight - 30, { align: 'center' });

      // Finalize the PDF
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
