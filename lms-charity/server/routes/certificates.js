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
    
    // Generate unique IDs
    const year = new Date().getFullYear();
    const randomId = Math.random().toString(36).substring(2, 15);
    const certificateId = `CERT-${year}-${randomId.toUpperCase()}`;
    const verificationCode = Math.random().toString(36).substring(2, 15).toUpperCase();
    
    // Create certificate record
    const certificate = await Certificate.create({
      user: req.user._id,
      course: courseId,
      certificateId,
      verificationCode,
      score: finalScore,
      grade,
      skills: course.tags || [],
      creditsEarned: Math.ceil(course.estimatedDuration || 1),
      completionDate: progress.completedAt || new Date()
    });
    
    // Generate PDF certificate with modern design
    const fileName = `certificate-${certificate.certificateId}.pdf`;
    const filePath = path.join(certificatesDir, fileName);
    
    // Generate the PDF
    await generateModernCertificatePDF(certificate, course, req.user, filePath);
    
    // Update certificate with placeholder file URL (will be generated on download)
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
        verificationCode: certificate.verificationCode,
        studentName: certificate.user.name,
        studentEmail: certificate.user.email,
        courseTitle: certificate.course.title,
        courseInstructor: certificate.course.instructor?.name || 'N/A',
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

// Modern Certificate PDF Generation - Rewritten to match CertificateViewer.jsx
async function generateModernCertificatePDF(certificate, course, user, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'portrait',
        size: [842, 1191], // A4 aspect ratio, larger size for quality
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const centerX = pageWidth / 2;

      // Colors
      const colors = {
        purple: { light: '#f5f3ff', medium: '#a78bfa', dark: '#8b5cf6' },
        blue: { light: '#eff6ff', medium: '#60a5fa', dark: '#3b82f6' },
        green: { light: '#f0fdf4', medium: '#4ade80', dark: '#22c55e' },
        gray: { light: '#f9fafb', medium: '#6b7280', dark: '#1f2937' },
        white: '#ffffff',
      };

      // Background Gradient
      const grad = doc.linearGradient(0, 0, pageWidth, pageHeight);
      grad.stop(0, colors.blue.light).stop(1, colors.purple.light);
      doc.rect(0, 0, pageWidth, pageHeight).fill(grad);

      // Decorative Borders
      const margin = 30;
      doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2)
         .strokeColor(colors.purple.medium)
         .lineWidth(1)
         .stroke();
      
      const innerMargin = margin + 8;
      doc.rect(innerMargin, innerMargin, pageWidth - innerMargin * 2, pageHeight - innerMargin * 2)
         .dash(6, { space: 6 })
         .strokeColor(colors.purple.medium)
         .lineWidth(0.5)
         .stroke();
      
      // Corner Elements
      const cornerSize = 80;
      const cornerMargin = margin + 20;
      const cornerWidth = 4;
      doc.save()
         .lineWidth(cornerWidth)
         .strokeColor(colors.purple.dark)
         .moveTo(cornerMargin, cornerMargin + cornerSize)
         .lineTo(cornerMargin, cornerMargin)
         .lineTo(cornerMargin + cornerSize, cornerMargin)
         .stroke();
      doc.save()
         .lineWidth(cornerWidth)
         .strokeColor(colors.purple.dark)
         .moveTo(pageWidth - cornerMargin, cornerMargin + cornerSize)
         .lineTo(pageWidth - cornerMargin, cornerMargin)
         .lineTo(pageWidth - cornerMargin - cornerSize, cornerMargin)
         .stroke();
      doc.save()
         .lineWidth(cornerWidth)
         .strokeColor(colors.purple.dark)
         .moveTo(cornerMargin, pageHeight - cornerMargin - cornerSize)
         .lineTo(cornerMargin, pageHeight - cornerMargin)
         .lineTo(cornerMargin + cornerSize, pageHeight - cornerMargin)
         .stroke();
      doc.save()
         .lineWidth(cornerWidth)
         .strokeColor(colors.purple.dark)
         .moveTo(pageWidth - cornerMargin, pageHeight - cornerMargin - cornerSize)
         .lineTo(pageWidth - cornerMargin, pageHeight - cornerMargin)
         .lineTo(pageWidth - cornerMargin - cornerSize, pageHeight - cornerMargin)
         .stroke();

      // Content
      const contentWidth = pageWidth * 0.8;
      let y = 150;

      // Header
      const gradHeader = doc.linearGradient(centerX - 30, y - 30, centerX + 30, y + 30);
      gradHeader.stop(0, colors.purple.dark).stop(1, colors.blue.dark);
      doc.circle(centerX, y, 30).fill(gradHeader);
      
      // Award Icon (using a simple star path as a placeholder for lucide icon)
      doc.save()
         .translate(centerX - 12, y - 12)
         .path('M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z')
         .fillColor(colors.white)
         .fill();
      doc.restore();
      
      y += 50;
      doc.font('Helvetica-Bold').fontSize(32).fillColor(colors.gray.dark)
         .text('CERTIFICATE OF COMPLETION', { align: 'center' });
      y += 50;
      
      const lineGrad = doc.linearGradient(centerX - 100, y, centerX + 100, y);
      lineGrad.stop(0, colors.purple.medium).stop(0.5, colors.blue.medium).stop(1, colors.purple.medium);
      doc.rect(centerX - 100, y, 200, 3).fill(lineGrad);
      y += 80;

      // Main Content
      doc.font('Helvetica').fontSize(18).fillColor(colors.gray.medium)
         .text('This is to certify that', { align: 'center' });
      y += 40;
      
      doc.font('Helvetica-Bold').fontSize(40).fillColor(colors.purple.dark)
         .text(user.name, { align: 'center' });
      doc.rect(centerX - (doc.widthOfString(user.name) / 2) - 20, y + 50, doc.widthOfString(user.name) + 40, 2)
         .fillColor(colors.purple.medium)
         .fill();
      y += 80;

      doc.font('Helvetica').fontSize(18).fillColor(colors.gray.medium)
         .text('has successfully completed the course', { align: 'center' });
      y += 40;

      doc.font('Helvetica-Oblique').fontSize(28).fillColor(colors.blue.dark)
         .text(`"${course.title}"`, { align: 'center', width: contentWidth, continued: false });
      y += 100;

      // Course Details
      const detailsWidth = pageWidth * 0.75;
      const detailsStartX = centerX - detailsWidth / 2;
      const colWidth = detailsWidth / 3;

      const details = [
        { label: 'INSTRUCTOR', value: course.instructor?.name || 'N/A', color: colors.purple },
        { label: 'COMPLETED ON', value: new Date(certificate.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), color: colors.blue },
        { label: 'GRADE', value: `${certificate.grade} (${certificate.score}%)`, color: colors.green },
      ];

      details.forEach((detail, i) => {
        const x = detailsStartX + (i * colWidth);
        doc.font('Helvetica-Bold').fontSize(11).fillColor(colors.gray.dark)
           .text(detail.label, x, y, { width: colWidth, align: 'center' });
        doc.font('Helvetica').fontSize(14).fillColor(colors.gray.medium)
           .text(detail.value, x, y + 20, { width: colWidth, align: 'center' });
      });
      y += 80;

      // Skills
      if (certificate.skills && certificate.skills.length > 0) {
        doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.gray.dark)
           .text('SKILLS ACQUIRED', { align: 'center' });
        y += 30;
        
        const skillsHtml = certificate.skills.map(skill => `<span>${skill}</span>`).join('');
        const skillsText = certificate.skills.join('     '); // Simple spacing
        
        doc.font('Helvetica').fontSize(11).fillColor(colors.gray.medium)
           .text(skillsText, { align: 'center', width: contentWidth });
        y += 60;
      }

      // Footer
      const footerY = pageHeight - 150;
      doc.moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).strokeColor(colors.gray.medium).lineWidth(0.5).stroke();
      
      const footerColWidth = (pageWidth - margin * 2) / 2;
      doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.gray.dark)
         .text('Certificate ID', margin, footerY + 20);
      doc.font('Helvetica').fontSize(10).fillColor(colors.gray.medium)
         .text(certificate.certificateId, margin, footerY + 35);

      doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.gray.dark)
         .text('Verification Code', pageWidth - margin - footerColWidth, footerY + 20, { align: 'right', width: footerColWidth });
      doc.font('Helvetica').fontSize(10).fillColor(colors.gray.medium)
         .text(certificate.verificationCode, pageWidth - margin - footerColWidth, footerY + 35, { align: 'right', width: footerColWidth });

      // Verified Seal
      const sealY = footerY + 70;
      const sealGrad = doc.linearGradient(centerX - 80, sealY, centerX + 80, sealY);
      sealGrad.stop(0, colors.purple.dark).stop(1, colors.blue.dark);
      doc.roundedRect(centerX - 80, sealY, 160, 25, 12.5).fill(sealGrad);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.white)
         .text('VERIFIED by EduCharity', centerX - 80, sealY + 8, { width: 160, align: 'center' });

      // Finalize
      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', (err) => reject(err));

    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
}

export default router;
