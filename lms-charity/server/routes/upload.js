import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const imagesDir = path.join(uploadsDir, 'images');
const videosDir = path.join(uploadsDir, 'videos');
const documentsDir = path.join(uploadsDir, 'documents');

[uploadsDir, imagesDir, videosDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for different file types
const createMulterConfig = (destination, fileFilter) => {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, destination);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    fileFilter: fileFilter,
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB limit
    }
  });
};

// File filters
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

const documentFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only document files (PDF, DOC, DOCX, PPT, PPTX, TXT) are allowed!'), false);
  }
};

// Multer configurations
const uploadImage = createMulterConfig(imagesDir, imageFilter);
const uploadVideo = createMulterConfig(videosDir, videoFilter);
const uploadDocument = createMulterConfig(documentsDir, documentFilter);

// @desc    Upload and optimize image
// @route   POST /api/upload/image
// @access  Private
router.post('/image', protect, uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { width = 800, height = 600, quality = 80 } = req.query;
    
    // Generate optimized filename
    const optimizedFilename = `optimized-${Date.now()}.webp`;
    const optimizedPath = path.join(imagesDir, optimizedFilename);
    
    // Process image with Sharp
    await sharp(req.file.path)
      .resize(parseInt(width), parseInt(height), {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: parseInt(quality) })
      .toFile(optimizedPath);
    
    // Delete original file
    fs.unlinkSync(req.file.path);
    
    const imageUrl = `/uploads/images/${optimizedFilename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded and optimized successfully',
      url: imageUrl,
      filename: optimizedFilename,
      originalName: req.file.originalname,
      size: fs.statSync(optimizedPath).size
    });
  } catch (error) {
    console.error('Image upload error:', error);
    // Clean up files on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// @desc    Upload video
// @route   POST /api/upload/video
// @access  Private
router.post('/video', protect, uploadVideo.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Video uploaded successfully',
      url: videoUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Video upload error:', error);
    // Clean up files on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error uploading video', error: error.message });
  }
});

// @desc    Upload document
// @route   POST /api/upload/document
// @access  Private
router.post('/document', protect, uploadDocument.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No document file provided' });
    }

    const documentUrl = `/uploads/documents/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Document uploaded successfully',
      url: documentUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Document upload error:', error);
    // Clean up files on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  }
});

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', protect, (req, res) => {
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        let destination = uploadsDir;
        if (file.mimetype.startsWith('image/')) {
          destination = imagesDir;
        } else if (file.mimetype.startsWith('video/')) {
          destination = videosDir;
        } else {
          destination = documentsDir;
        }
        cb(null, destination);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
      files: 10 // Maximum 10 files
    }
  }).array('files', 10);

  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const uploadedFiles = [];

      for (const file of req.files) {
        let fileUrl = `/uploads/`;
        
        if (file.mimetype.startsWith('image/')) {
          fileUrl += `images/${file.filename}`;
        } else if (file.mimetype.startsWith('video/')) {
          fileUrl += `videos/${file.filename}`;
        } else {
          fileUrl += `documents/${file.filename}`;
        }

        uploadedFiles.push({
          url: fileUrl,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        });
      }

      res.json({
        success: true,
        message: `${uploadedFiles.length} files uploaded successfully`,
        files: uploadedFiles
      });
    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({ message: 'Error processing uploaded files' });
    }
  });
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:type/:filename
// @access  Private
router.delete('/:type/:filename', protect, async (req, res) => {
  try {
    const { type, filename } = req.params;
    
    let filePath;
    switch (type) {
      case 'images':
        filePath = path.join(imagesDir, filename);
        break;
      case 'videos':
        filePath = path.join(videosDir, filename);
        break;
      case 'documents':
        filePath = path.join(documentsDir, filename);
        break;
      default:
        return res.status(400).json({ message: 'Invalid file type' });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ message: 'Error deleting file' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 50MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum is 10 files.' });
    }
  }
  
  res.status(400).json({ message: error.message });
});

export default router;
