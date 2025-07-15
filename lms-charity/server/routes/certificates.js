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

const certificatesDir = path.join(process.cwd(), 'uploads', 'certificates');
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

// --- FINAL, UDEMY-STYLE PDF GENERATION ---
async function generateCertificatePDF(certificate, course, user, filePath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const colors = {
        primary: '#4a0e8a', // Deep Purple
        text: '#1f2937', // Dark Gray
        lightText: '#6b7280', // Medium Gray
        bgColor: '#FFFFFF',
        borderColor: '#E5E7EB' // Light Gray for border
      };

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 40;

      // Background
      doc.rect(0, 0, pageWidth, pageHeight).fill(colors.bgColor);

      // Double Border
      doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2)
         .lineWidth(1)
         .strokeColor(colors.borderColor)
         .stroke();
      doc.rect(margin + 5, margin + 5, pageWidth - (margin + 5) * 2, pageHeight - (margin + 5) * 2)
         .lineWidth(2)
         .strokeColor(colors.primary)
         .stroke();

      // Main Content
      const contentX = margin + 20;
      const contentWidth = pageWidth - (margin + 20) * 2;

      // EduCharity Logo (Placeholder)
      doc.font('Times-Bold').fontSize(24).fillColor(colors.primary)
         .text('EduCharity', contentX, 70, { align: 'left' });

      // Main Text
      let y = 180;
      doc.font('Times-Roman').fontSize(18).fillColor(colors.lightText)
         .text('This is to certify that', { align: 'center' });

      doc.moveDown(2);

      // Student Name
      doc.font('Times-Bold').fontSize(48).fillColor(colors.text)
         .text(user.name, { align: 'center' });

      doc.moveDown(2);

      // Course Completion Text
      doc.font('Times-Roman').fontSize(18).fillColor(colors.lightText)
         .text('successfully completed the course', { align: 'center' });

      doc.moveDown(1);

      // Course Title
      doc.font('Times-Bold').fontSize(24).fillColor(colors.text)
         .text(course.title, { align: 'center' });

      doc.moveDown(3);

      // Date and Length
      const completionDate = new Date(certificate.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const courseHours = course.estimatedDuration ? `${course.estimatedDuration} hours` : '';
      doc.font('Times-Roman').fontSize(14).fillColor(colors.lightText)
         .text(`${completionDate} • ${courseHours}`, { align: 'center' });

      // Footer Section
      const footerY = pageHeight - 120;
      const sigWidth = 250;
      const sigCol1 = margin + 50;
      const sigCol2 = pageWidth - margin - 50 - sigWidth;

      // Instructor Signature
      doc.font('Times-Bold').fontSize(14).fillColor(colors.text)
         .text(course.instructor?.name || 'EduCharity Team', sigCol1, footerY, { width: sigWidth, align: 'center' });
      doc.rect(sigCol1, footerY + 20, sigWidth, 0.5).strokeColor(colors.text).stroke();
      doc.font('Times-Roman').fontSize(12).fillColor(colors.lightText)
         .text('Instructor', sigCol1, footerY + 25, { width: sigWidth, align: 'center' });

      // CEO Signature
      doc.font('Times-Bold').fontSize(14).fillColor(colors.text)
         .text('CEO, EduCharity', sigCol2, footerY, { width: sigWidth, align: 'center' });
      doc.rect(sigCol2, footerY + 20, sigWidth, 0.5).strokeColor(colors.text).stroke();
      doc.font('Times-Roman').fontSize(12).fillColor(colors.lightText)
         .text('Chief Executive Officer', sigCol2, footerY + 25, { width: sigWidth, align: 'center' });

      // Verification Info
      doc.font('Helvetica').fontSize(10).fillColor(colors.lightText)
         .text(`Certificate ID: ${certificate.certificateId}`, margin, pageHeight - margin + 10, { align: 'left' });

      doc.end();

      stream.on('finish', () => resolve(filePath));
      stream.on('error', (err) => reject(err));

    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
}


// @desc    Generate or retrieve a certificate for a completed course
// @route   POST /api/certificates/generate
// @access  Private
router.post('/generate', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    const progress = await Progress.findOne({ user: userId, course: courseId, isCompleted: true });
    if (!progress) {
      return res.status(400).json({ message: 'Course not completed.' });
    }

    let certificate = await Certificate.findOne({ user: userId, course: courseId });

    if (certificate) {
      return res.status(200).json({ message: 'Certificate already exists.', certificate });
    }

    const course = await Course.findById(courseId).populate('instructor', 'name');
    const user = await User.findById(userId);

    const finalScore = Math.round(
      progress.completedLessons.reduce((sum, l) => sum + (l.quizScore || 0), 0) /
      (progress.completedLessons.filter(l => l.quizScore !== undefined).length || 1)
    ) || 100;

    let grade = 'Pass';
    if (finalScore >= 90) grade = 'Excellent';
    else if (finalScore >= 80) grade = 'Good';
    else if (finalScore >= 70) grade = 'Satisfactory';

    const certificateId = `CERT-${Date.now()}-${userId.toString().slice(-4)}`;
    const verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    certificate = await Certificate.create({
      user: userId,
      course: courseId,
      certificateId,
      verificationCode,
      score: finalScore,
      grade,
      completionDate: progress.completedAt || new Date(),
      certificateUrl: `/uploads/certificates/certificate-${certificateId}.pdf`,
    });

    const filePath = path.join(certificatesDir, `certificate-${certificateId}.pdf`);
    await generateCertificatePDF(certificate, course, user, filePath);

    await User.findByIdAndUpdate(userId, { $inc: { certificatesEarned: 1 } });

    res.status(201).json({ message: 'Certificate generated successfully.', certificate });

  } catch (error) {
    console.error('Certificate Generation Error:', error);
    res.status(500).json({ message: 'Server error generating certificate.' });
  }
});

// @desc    Download a certificate
// @route   GET /api/certificates/download/:certificateId
// @access  Private
router.get('/download/:certificateId', protect, async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ 
      certificateId: req.params.certificateId,
      user: req.user._id 
    }).populate('course');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found.' });
    }

    const filePath = path.join(certificatesDir, `certificate-${certificate.certificateId}.pdf`);

    // Always regenerate the PDF to ensure the latest design is used.
    const user = await User.findById(req.user._id);
    await generateCertificatePDF(certificate, certificate.course, user, filePath);
    
    await certificate.markAsDownloaded();

    res.download(filePath, `EduCharity-${certificate.course.title}-Certificate.pdf`);

  } catch (error) {
    console.error('Certificate Download Error:', error);
    res.status(500).json({ message: 'Server error downloading certificate.' });
  }
});

// @desc    Get all certificates for the logged-in user
// @route   GET /api/certificates/my-certificates
// @access  Private
router.get('/my-certificates', protect, async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .populate({
        path: 'course',
        select: 'title instructor category',
        populate: { path: 'instructor', select: 'name' }
      })
      .sort({ completionDate: -1 });

    res.json({ success: true, data: certificates });
  } catch (error) {
    console.error('Get My Certificates Error:', error);
    res.status(500).json({ message: 'Server error fetching certificates.' });
  }
});

// @desc    Verify a certificate's authenticity
// @route   GET /api/certificates/verify/:certificateId/:verificationCode
// @access  Public
router.get('/verify/:certificateId/:verificationCode', async (req, res) => {
  try {
    const { certificateId, verificationCode } = req.params;
    const certificate = await Certificate.verifyCertificate(certificateId, verificationCode);

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Invalid certificate.' });
    }

    res.json({ success: true, message: 'Certificate is valid.', data: certificate });
  } catch (error) {
    console.error('Certificate Verification Error:', error);
    res.status(500).json({ message: 'Server error verifying certificate.' });
  }
});

export default router;