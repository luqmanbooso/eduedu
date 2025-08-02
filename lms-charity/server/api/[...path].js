import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from '../routes/auth.js';
import courseRoutes from '../routes/courses.js';
import lessonRoutes from '../routes/lessons.js';
import instructorRoutes from '../routes/instructor.js';
import adminRoutes from '../routes/admin.js';
import uploadRoutes from '../routes/upload.js';
import commentRoutes from '../routes/comments.js';
import notificationRoutes from '../routes/notifications.js';
import certificateRoutes from '../routes/certificates.js';
import progressRoutes from '../routes/progress.js';
import profileRoutes from '../routes/profile.js';
import discussionRoutes from '../routes/discussions.js';
import enrollmentRoutes from '../routes/enrollment.js';
import wishlistRoutes from '../routes/wishlist.js';
import gradingRoutes from '../routes/grading.js';
import contactRoutes from '../routes/contact.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://eduedu-dh5w.vercel.app',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
app.use('/courses', discussionRoutes);
app.use('/lessons', lessonRoutes);
app.use('/instructor', instructorRoutes);
app.use('/admin', adminRoutes);
app.use('/upload', uploadRoutes);
app.use('/comments', commentRoutes);
app.use('/notifications', notificationRoutes);
app.use('/certificates', certificateRoutes);
app.use('/progress', progressRoutes);
app.use('/profile', profileRoutes);
app.use('/enrollment', enrollmentRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/grading', gradingRoutes);
app.use('/contact', contactRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'EduCharity LMS API Server', 
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      courses: '/api/courses',
      lessons: '/api/lessons',
      instructor: '/api/instructor',
      admin: '/api/admin',
      upload: '/api/upload',
      certificates: '/api/certificates',
      progress: '/api/progress',
      profile: '/api/profile',
      enrollment: '/api/enrollment',
      wishlist: '/api/wishlist',
      grading: '/api/grading',
      contact: '/api/contact'
    },
    timestamp: new Date().toISOString() 
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    message: 'Charity LMS API is running!', 
    timestamp: new Date().toISOString() 
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MongoDB URI not found in environment variables');
      return;
    }
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

// Connect to database
connectDB();

// Export for Vercel serverless
export default app; 