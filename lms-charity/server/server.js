import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });
console.log('GMAIL_USER (server.js):', process.env.GMAIL_USER);
console.log('GMAIL_APP_PASSWORD (server.js):', process.env.GMAIL_APP_PASSWORD ? 'SET' : 'MISSING');

// Import routes
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import lessonRoutes from './routes/lessons.js';
import instructorRoutes from './routes/instructor.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import commentRoutes from './routes/comments.js';
import notificationRoutes from './routes/notifications.js';
import certificateRoutes from './routes/certificates.js';
import progressRoutes from './routes/progress.js';
import profileRoutes from './routes/profile.js';
import discussionRoutes from './routes/discussions.js';
import enrollmentRoutes from './routes/enrollment.js';
import wishlistRoutes from './routes/wishlist.js';
import gradingRoutes from './routes/grading.js';
import contactRoutes from './routes/contact.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger (add this middleware)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Body:`, req.body);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/courses', discussionRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/grading', gradingRoutes);
app.use('/api/contact', contactRoutes);

// Serve static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Charity LMS API is running!', 
    timestamp: new Date().toISOString() 
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
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/charity-lms';
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
};

startServer();
