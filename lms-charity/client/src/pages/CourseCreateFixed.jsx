import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import LessonCreationModal from '../components/LessonCreationModal';
import CompletionRequirementsModal from '../components/CompletionRequirementsModal';
import { 
  BookOpen, 
  Upload, 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft,
  FileText,
  Video,
  Image,
  Settings,
  Clock,
  Users,
  Star,
  Award,
  Calendar,
  DollarSign,
  Eye,
  CheckCircle,
  Brain,
  FileQuestion,
  Globe,
  Target,
  HelpCircle,
  MessageSquare,
  X,
  GraduationCap,
  Timer,
  PlayCircle,
  Lightbulb,
  Zap,
  Camera,
  Edit3,
  Gift,
  Send,
  Check,
  Rocket,
  TrendingUp,
  Heart,
  ThumbsUp,
  Download,
  Share,
  AlertCircle,
  CheckSquare,
  XCircle,
  Info,
  BookOpenCheck,
  PenTool,
  Presentation,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Clock3,
  Trophy,
  Medal,
  Crown,
  Flame,
  Sparkles
} from 'lucide-react';

const CourseCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  
  const [courseData, setCourseData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    subcategory: '',
    level: 'Beginner',
    thumbnail: '',
    previewVideo: '',
    price: 0,
    discountPrice: 0,
    currency: 'USD',
    estimatedDuration: '',
    estimatedCompletionTime: '',
    language: 'English',
    tags: [],
    learningOutcomes: [''],
    requirements: [''],
    targetAudience: [''],
    modules: [],
    certificate: {
      isAvailable: true,
      requirements: {
        minimumScore: 70,
        completionPercentage: 100
      },
      template: {
        design: 'modern',
        backgroundColor: '#ffffff',
        accentColor: '#8B5CF6',
        fontStyle: 'professional',
        includeInstructorSignature: true,
        includeCourseLogo: true,
        customMessage: 'This certifies that the above-named individual has successfully completed the course requirements and demonstrated proficiency in the subject matter.'
      }
    },
    pricing: {
      type: 'free',
      donationSuggested: 0
    },
    settings: {
      allowDiscussions: true,
      allowDownloads: true,
      allowReviews: true,
      maxStudents: null,
      enrollmentDeadline: '',
      startDate: '',
      endDate: '',
      completionRequirements: {
        watchAllVideos: true,
        completeAllQuizzes: true,
        submitAllAssignments: true,
        minimumQuizScore: 70,
        minimumAssignmentScore: 70,
        participateInDiscussions: false,
        timeBasedCompletion: false,
        minimumTimeSpent: 0
      },
      welcomeMessage: {
        enabled: true,
        title: 'Welcome to Your Learning Journey!',
        content: 'Thank you for enrolling in this course. I\'m excited to guide you through this learning experience. Feel free to ask questions and engage with fellow students in the discussion area.',
        includeResources: true,
        includeTips: true,
        videoWelcomeMessage: ''
      },
      engagement: {
        sendReminders: true,
        reminderFrequency: 'weekly',
        celebrateProgress: true,
        encourageReviews: true,
        milestoneRewards: true,
        progressEmails: true
      },
      assessments: {
        enableSectionQuizzes: true,
        enableFinalExam: false,
        finalExamWeight: 30,
        quizRetakePolicy: 'unlimited',
        showCorrectAnswers: 'after_completion',
        randomizeQuestions: true,
        preventSkipping: false
      }
    }
  });

  // Simplified state for better error handling
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Utility functions for file compression
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const needsCompression = (file, maxSize = 10 * 1024 * 1024) => {
    return file.size > maxSize;
  };

  const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          }, 'image/jpeg', quality);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const getCompressionTips = (fileType) => {
    if (fileType.startsWith('image/')) {
      return [
        'Use JPEG format for photos (better compression)',
        'Use PNG for graphics with transparency',
        'Consider reducing image dimensions',
        'Use tools like TinyPNG for additional compression'
      ];
    } else if (fileType.startsWith('video/')) {
      return [
        'Use H.264 codec with lower bitrate',
        'Reduce resolution to 720p or 480p',
        'Keep video length under 2-3 minutes for previews',
        'Use HandBrake or similar tools for compression',
        'Consider splitting longer videos into segments'
      ];
    }
    return [];
  };

  // Upload handlers with compression
  const handleThumbnailUpload = async (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    setUploadingThumbnail(true);
    
    try {
      let fileToUpload = file;
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (needsCompression(file, maxSize)) {
        const loadingToast = toast.loading('Compressing image...');
        
        try {
          const compressedFile = await compressImage(file, 1920, 1080, 0.8);
          
          if (compressedFile.size < maxSize) {
            fileToUpload = compressedFile;
            toast.dismiss(loadingToast);
            toast.success(`Image compressed from ${formatFileSize(file.size)} to ${formatFileSize(compressedFile.size)}`);
          } else {
            const moreCompressed = await compressImage(file, 1280, 720, 0.6);
            
            if (moreCompressed.size < maxSize) {
              fileToUpload = moreCompressed;
              toast.dismiss(loadingToast);
              toast.success(`Image compressed from ${formatFileSize(file.size)} to ${formatFileSize(moreCompressed.size)}`);
            } else {
              toast.dismiss(loadingToast);
              const tips = getCompressionTips(file.type);
              toast.error(
                `Even after compression, file size (${formatFileSize(moreCompressed.size)}) exceeds 10MB limit. 
                
                Try these tips:
                ${tips.slice(0, 2).map(tip => `• ${tip}`).join('\n')}
                
                Or upgrade your Cloudinary plan for larger files.`
              );
              return;
            }
          }
        } catch (compressionError) {
          toast.dismiss(loadingToast);
          console.error('Compression error:', compressionError);
          toast.error('Failed to compress image. Please try a different image or reduce its size manually.');
          return;
        }
      }
      
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('type', 'image');
      
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/courses/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        baseURL: import.meta.env.VITE_API_URL || 'https://eduback.vercel.app/api'
      });
      
      setCourseData(prev => ({
        ...prev,
        thumbnail: response.data.data.url
      }));
      
      toast.success('Thumbnail uploaded successfully!');
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      toast.error('Failed to upload thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create Your Course
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Share your knowledge with the world
          </p>
          
          {/* Thumbnail Upload Section */}
          <div className="max-w-md mx-auto bg-white rounded-lg border-2 border-dashed border-gray-300 p-6">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Upload your course thumbnail
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleThumbnailUpload(e.target.files[0])}
                disabled={uploadingThumbnail}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {uploadingThumbnail && (
                <p className="text-sm text-purple-600 mt-2">Uploading...</p>
              )}
              {courseData.thumbnail && (
                <div className="mt-4">
                  <img 
                    src={courseData.thumbnail} 
                    alt="Course thumbnail" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
              Cancel
            </button>
            <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCreate;
