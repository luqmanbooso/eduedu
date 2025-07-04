import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  ThumbsUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { courseAPI } from '../services/api';

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
      type: 'free', // free, paid, donation
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
      welcomeMessage: {
        enabled: true,
        title: 'Welcome to Your Learning Journey!',
        content: 'Thank you for enrolling in this course. I\'m excited to guide you through this learning experience. Feel free to ask questions and engage with fellow students in the discussion area.',
        includeResources: true,
        includeTips: true
      },
      engagement: {
        sendReminders: true,
        reminderFrequency: 'weekly',
        celebrateProgress: true,
        encourageReviews: true
      }
    }
  });

  const [newTag, setNewTag] = useState('');
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    estimatedDuration: '',
    lessons: []
  });
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    type: 'video',
    videoUrl: '',
    videoDuration: '',
    content: '',
    resources: [],
    quiz: {
      questions: [],
      timeLimit: 30,
      passingScore: 70,
      attemptsAllowed: 3
    },
    assignment: {
      title: '',
      description: '',
      instructions: '',
      maxScore: 100,
      dueDate: '',
      submissionType: 'both'
    },
    isPreview: false
  });
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(null);

  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const categories = [
    'Programming',
    'Data Science',
    'AI/ML',
    'Cybersecurity',
    'Software Engineering', 
    'IoT & Hardware',
    'Digital Marketing',
    'Design',
    'Business',
    'Science',
    'Language',
    'Other'
  ];

  const subcategories = {
    'Programming': ['Web Development', 'Mobile Development', 'Game Development', 'Backend Development'],
    'Data Science': ['Machine Learning', 'Data Analysis', 'Statistics', 'Big Data'],
    'AI/ML': ['Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Reinforcement Learning'],
    'Design': ['UI/UX Design', 'Graphic Design', '3D Design', 'Motion Graphics'],
    'Business': ['Entrepreneurship', 'Management', 'Finance', 'Marketing Strategy']
  };

  const levels = [
    { value: 'Beginner', label: 'Beginner', description: 'No prior experience required' },
    { value: 'Intermediate', label: 'Intermediate', description: 'Some experience helpful' },
    { value: 'Advanced', label: 'Advanced', description: 'Extensive experience required' }
  ];

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi'
  ];

  const steps = [
    { 
      id: 1, 
      title: 'Course Identity', 
      icon: Lightbulb, 
      description: 'Create a compelling title & choose your category',
      motivation: 'Your title is the first impression - make it count!',
      tips: [
        'Use keywords your audience searches for',
        'Make it clear and descriptive',
        'Think about your target learners'
      ]
    },
    { 
      id: 2, 
      title: 'Course Structure', 
      icon: Target, 
      description: 'Design your curriculum with clear learning paths',
      motivation: 'Great courses have structure - guide your students step by step!',
      tips: [
        'Start with basics, progress to advanced',
        'Each lesson should have a clear objective',
        'Plan for 5-10 minutes per video'
      ]
    },
    { 
      id: 3, 
      title: 'Content Creation', 
      icon: Camera, 
      description: 'Upload videos, add quizzes & provide resources',
      motivation: 'This is where the magic happens - create engaging content!',
      tips: [
        'Record in high quality (1080p preferred)',
        'Add interactive quizzes for engagement',
        'Include downloadable resources'
      ]
    },
    { 
      id: 4, 
      title: 'Course Landing Page', 
      icon: Star, 
      description: 'Create your sales pitch & course preview',
      motivation: 'Your landing page sells your course - make it irresistible!',
      tips: [
        'Include a compelling promotional video',
        'Highlight key benefits and outcomes',
        'Show your credentials and experience'
      ]
    },
    { 
      id: 5, 
      title: 'Pricing & Promotions', 
      icon: Gift, 
      description: 'Set competitive pricing & create attractive offers',
      motivation: 'Smart pricing attracts the right students to your course!',
      tips: [
        'Research competitor pricing',
        'Consider introductory discounts',
        'Use coupons for marketing'
      ]
    },
    { 
      id: 6, 
      title: 'Student Experience', 
      icon: Heart, 
      description: 'Design welcome messages & engagement strategies',
      motivation: 'Happy students become your best advocates!',
      tips: [
        'Create warm welcome messages',
        'Encourage questions and interaction',
        'Plan for ongoing engagement'
      ]
    },
    { 
      id: 7, 
      title: 'Launch Ready', 
      icon: Rocket, 
      description: 'Review, submit & prepare for success',
      motivation: 'You\'re about to impact lives - get ready to launch!',
      tips: [
        'Review all content for quality',
        'Check grammar and spelling',
        'Ensure promotional video is compelling'
      ]
    }
  ];

  // Helper function to get motivational messages
  const getMotivationalMessage = (step) => {
    const messages = {
      1: "🎯 You're about to create something amazing! Let's start with a title that captures attention.",
      2: "🏗️ Time to build the foundation! Structure creates clarity for your students.",
      3: "🎬 This is where your expertise shines! Create content that transforms lives.",
      4: "✨ Make your course irresistible! Your landing page is your first impression.",
      5: "💰 Price it right to attract your ideal students! You deserve to be compensated for your expertise.",
      6: "❤️ Create connections that last! Engaged students become lifelong fans.",
      7: "🚀 You're ready to launch! Your course will impact lives around the world."
    };
    return messages[step] || "You're doing great! Keep going!";
  };

  // Step progress component
  const StepProgress = ({ currentStep, totalSteps }) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-purple-600">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
        />
      </div>
    </div>
  );

  // Motivational step header
  const StepHeader = ({ step }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-8"
    >
      <div className="flex items-center justify-center mb-4">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full">
          <step.icon className="w-8 h-8 text-white" />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{step.title}</h2>
      <p className="text-lg text-gray-600 mb-4">{step.description}</p>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
        <p className="text-purple-800 font-medium">{getMotivationalMessage(step.id)}</p>
      </div>
      {step.tips && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2" />
            Pro Tips:
          </h4>
          <ul className="text-blue-800 text-sm space-y-1">
            {step.tips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );

  // Success celebration component
  const SuccessMessage = ({ message, onClose }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-white rounded-lg p-8 max-w-md mx-4 text-center"
      >
        <div className="text-green-500 mb-4">
          <CheckCircle className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-bold mb-2">Great Job!</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <button
          onClick={onClose}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );

  // Certificate preview component
  const CertificatePreview = () => (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-8 shadow-lg">
      <div className="text-center border-4 border-purple-600 p-8 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="mb-6">
          <Award className="w-16 h-16 mx-auto text-purple-600 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Certificate of Completion</h3>
          <p className="text-gray-600">This certifies that</p>
        </div>
        <div className="my-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">[Student Name]</div>
          <p className="text-lg text-gray-700">has successfully completed</p>
          <div className="text-2xl font-bold text-gray-900 my-2">{courseData.title || '[Course Title]'}</div>
        </div>
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-300">
          <div className="text-left">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-sm text-gray-600">Instructor</p>
              <p className="font-semibold">{user.name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">[Completion Date]</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleInputChange = (field, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setCourseData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setCourseData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addModule = () => {
    if (newModule.title.trim()) {
      setCourseData(prev => ({
        ...prev,
        modules: [...prev.modules, { 
          ...newModule, 
          id: Date.now(),
          order: prev.modules.length + 1,
          lessons: []
        }]
      }));
      setNewModule({
        title: '',
        description: '',
        estimatedDuration: '',
        lessons: []
      });
      setShowModuleModal(false);
    }
  };

  const removeModule = (moduleId) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }));
  };

  const addLessonToModule = (moduleIndex) => {
    if (newLesson.title.trim()) {
      setCourseData(prev => ({
        ...prev,
        modules: prev.modules.map((module, index) => 
          index === moduleIndex
            ? {
                ...module,
                lessons: [...module.lessons, { 
                  ...newLesson, 
                  id: Date.now(),
                  order: module.lessons.length + 1
                }]
              }
            : module
        )
      }));
      setNewLesson({
        title: '',
        description: '',
        type: 'video',
        videoUrl: '',
        videoDuration: '',
        content: '',
        resources: [],
        quiz: {
          questions: [],
          timeLimit: 30,
          passingScore: 70,
          attemptsAllowed: 3
        },
        assignment: {
          title: '',
          description: '',
          instructions: '',
          maxScore: 100,
          dueDate: '',
          submissionType: 'both'
        },
        isPreview: false
      });
      setShowLessonModal(false);
    }
  };

  const removeLessonFromModule = (moduleIndex, lessonId) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) => 
        index === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
            }
          : module
      )
    }));
  };

  const handleSubmit = async () => {
    console.log('=== Frontend Course Creation ===');
    console.log('User:', user);
    console.log('Course Data:', courseData);
    
    setLoading(true);
    try {
      // Validate required fields
      if (!courseData.title || !courseData.description || !courseData.category) {
        console.log('Frontend validation failed:', {
          title: courseData.title,
          description: courseData.description,
          category: courseData.category
        });
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate that course has at least one module (temporarily commented out for debugging)
      // if (courseData.modules.length === 0) {
      //   console.log('No modules found');
      //   toast.error('Please add at least one module to your course');
      //   setLoading(false);
      //   return;
      // }

      // Validate that each module has at least one lesson (temporarily commented out for debugging)
      // const hasLessons = courseData.modules.some(module => module.lessons.length > 0);
      // if (!hasLessons) {
      //   console.log('No lessons found in modules');
      //   toast.error('Please add at least one lesson to your modules');
      //   setLoading(false);
      //   return;
      // }

      // Prepare course data for API
      const submissionData = {
        title: courseData.title,
        description: courseData.description,
        shortDescription: courseData.shortDescription,
        category: courseData.category,
        subcategory: courseData.subcategory,
        level: courseData.level,
        thumbnail: {
          url: courseData.thumbnail,
          publicId: ''
        },
        previewVideo: {
          url: courseData.previewVideo,
          publicId: '',
          duration: 0
        },
        price: courseData.pricing.type === 'free' ? 0 : courseData.price,
        discountPrice: courseData.discountPrice || undefined,
        currency: courseData.currency,
        estimatedDuration: courseData.estimatedDuration,
        estimatedCompletionTime: courseData.estimatedCompletionTime,
        language: courseData.language,
        tags: courseData.tags,
        learningOutcomes: courseData.learningOutcomes.filter(outcome => outcome.trim()),
        requirements: courseData.requirements.filter(req => req.trim()),
        targetAudience: courseData.targetAudience.filter(audience => audience.trim()),
        modules: courseData.modules.map(module => ({
          title: module.title,
          description: module.description,
          estimatedDuration: parseFloat(module.estimatedDuration) || 0,
          order: module.order,
          lessons: module.lessons.map(lesson => ({
            title: lesson.title,
            description: lesson.description,
            type: lesson.type,
            content: lesson.content || '',
            videoUrl: lesson.videoUrl || '',
            videoDuration: lesson.videoDuration || 0,
            order: lesson.order,
            isPreview: lesson.isPreview || false,
            quiz: lesson.type === 'quiz' ? lesson.quiz : undefined,
            assignment: lesson.type === 'assignment' ? lesson.assignment : undefined,
            resources: lesson.resources || []
          }))
        })),
        certificate: {
          isAvailable: courseData.certificate.isAvailable,
          requirements: {
            minimumScore: courseData.certificate.requirements?.minimumScore || 70,
            completionPercentage: courseData.certificate.requirements?.completionPercentage || 100
          }
        },
        settings: courseData.settings,
        status: 'draft',
        isPublished: false
      };

      console.log('Submission data prepared:', submissionData);
      console.log('Making API call...');

      const response = await courseAPI.createCourse(submissionData);
      console.log('API Response:', response);
      
      toast.success('Course created successfully!');
      navigate('/instructor/dashboard');
    } catch (error) {
      console.error('=== Frontend Course Creation Error ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (activeStep < steps.length) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const getStepValidation = (step) => {
    switch (step) {
      case 1:
        return courseData.title && courseData.description && courseData.category;
      case 2:
        return courseData.modules.length > 0;
      case 3:
        return true; // Optional
      case 4:
        return true; // Optional
      case 5:
        return true; // Optional
      case 6:
        return true; // Optional
      default:
        return true;
    }
  };

  const handleThumbnailUpload = async (file) => {
    if (!file) return;
    
    setUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');
      
      // Create configured axios instance
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/courses/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        baseURL: 'http://localhost:5000'
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

  const handlePreviewVideoUpload = async (file) => {
    if (!file) return;
    
    setUploadingPreview(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video');
      
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/courses/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        baseURL: 'http://localhost:5000'
      });
      
      setCourseData(prev => ({
        ...prev,
        previewVideo: response.data.data.url
      }));
      
      toast.success('Preview video uploaded successfully!');
    } catch (error) {
      console.error('Preview video upload error:', error);
      toast.error('Failed to upload preview video');
    } finally {
      setUploadingPreview(false);
    }
  };

  const handleLessonVideoUpload = async (file) => {
    if (!file) return;
    
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video');
      
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/courses/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        baseURL: 'http://localhost:5000'
      });
      
      setNewLesson(prev => ({
        ...prev,
        videoUrl: response.data.data.url,
        videoDuration: response.data.data.duration || 0
      }));
      
      toast.success('Video uploaded successfully!');
    } catch (error) {
      console.error('Video upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/instructor/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Back to Dashboard</span>
            </motion.button>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create Your Course
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Share your knowledge with the world. Build engaging content that transforms lives.
            </p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isCompleted = activeStep > step.id;
              const isValid = getStepValidation(step.id);
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? 'border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-200'
                          : isCompleted
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 bg-white text-gray-400 hover:border-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </motion.div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${isActive || isCompleted ? 'text-purple-600' : 'text-gray-500'}`}>
                        {step.title}
                      </p>
                      <p className={`text-xs hidden sm:block ${isActive || isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-8 lg:p-12">
            {/* Step 1: Basic Info */}
            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Basic Course Information</h2>
                  <p className="text-gray-600">Let's start with the fundamentals of your course</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={courseData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Complete React Development Masterclass"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={courseData.shortDescription}
                        onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                        rows={2}
                        maxLength={200}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Brief description for course cards and search results"
                      />
                      <p className="text-xs text-gray-500 mt-1">{courseData.shortDescription.length}/200</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={courseData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Detailed description of what students will learn..."
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={courseData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select category</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                        <select
                          value={courseData.subcategory}
                          onChange={(e) => handleInputChange('subcategory', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          disabled={!courseData.category || !subcategories[courseData.category]}
                        >
                          <option value="">Select subcategory</option>
                          {courseData.category && subcategories[courseData.category]?.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                      <div className="space-y-3">
                        {levels.map(level => (
                          <label key={level.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name="level"
                              value={level.value}
                              checked={courseData.level === level.value}
                              onChange={(e) => handleInputChange('level', e.target.value)}
                              className="mr-3 text-purple-600"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{level.label}</div>
                              <div className="text-sm text-gray-500">{level.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select
                          value={courseData.language}
                          onChange={(e) => handleInputChange('language', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {languages.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estimated Duration
                        </label>
                        <input
                          type="text"
                          value={courseData.estimatedDuration}
                          onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., 8 hours"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Completion Time
                      </label>
                      <input
                        type="text"
                        value={courseData.estimatedCompletionTime}
                        onChange={(e) => handleInputChange('estimatedCompletionTime', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., 6 weeks at 3-4 hours/week"
                      />
                    </div>
                  </div>
                </div>

                {/* Learning Outcomes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What will students learn? <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {courseData.learningOutcomes.map((outcome, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={outcome}
                          onChange={(e) => handleArrayInputChange('learningOutcomes', index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Students will be able to..."
                        />
                        {courseData.learningOutcomes.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('learningOutcomes', index)}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addArrayItem('learningOutcomes')}
                    className="mt-3 flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Learning Outcome</span>
                  </button>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Course Requirements</label>
                  <div className="space-y-3">
                    {courseData.requirements.map((requirement, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => handleArrayInputChange('requirements', index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Basic programming knowledge, etc."
                        />
                        {courseData.requirements.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('requirements', index)}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addArrayItem('requirements')}
                    className="mt-3 flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Requirement</span>
                  </button>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Target Audience</label>
                  <div className="space-y-3">
                    {courseData.targetAudience.map((audience, index) => (
                      <div key={index} className="flex space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                          <Target className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={audience}
                          onChange={(e) => handleArrayInputChange('targetAudience', index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Beginner developers, students, professionals..."
                        />
                        {courseData.targetAudience.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('targetAudience', index)}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addArrayItem('targetAudience')}
                    className="mt-3 flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Target Audience</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Curriculum */}
            {activeStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Course Curriculum</h2>
                  <p className="text-gray-600">Organize your course into modules and lessons</p>
                </div>

                {/* Add Module Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowModuleModal(true)}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Module</span>
                  </button>
                </div>

                {/* Modules List */}
                <div className="space-y-6">
                  {courseData.modules.map((module, moduleIndex) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">Module {moduleIndex + 1}: {module.title}</h3>
                          <p className="text-sm text-gray-600">{module.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{module.lessons.length} lessons</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedModuleIndex(moduleIndex);
                              setShowLessonModal(true);
                            }}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeModule(module.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Lessons */}
                      {module.lessons.length > 0 && (
                        <div className="p-4 space-y-3">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${
                                  lesson.type === 'video' ? 'bg-blue-100 text-blue-600' :
                                  lesson.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                                  lesson.type === 'assignment' ? 'bg-green-100 text-green-600' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {lesson.type === 'video' ? <Video className="w-4 h-4" /> :
                                   lesson.type === 'quiz' ? <Brain className="w-4 h-4" /> :
                                   lesson.type === 'assignment' ? <FileQuestion className="w-4 h-4" /> :
                                   <FileText className="w-4 h-4" />}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                  <p className="text-sm text-gray-600">{lesson.description}</p>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <span className="text-xs text-gray-500 capitalize">{lesson.type}</span>
                                    {lesson.videoDuration && (
                                      <span className="text-xs text-gray-500">{lesson.videoDuration}</span>
                                    )}
                                    {lesson.isPreview && (
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Preview</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => removeLessonFromModule(moduleIndex, lesson.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {courseData.modules.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
                    <p className="text-gray-600 mb-4">Start building your course by adding your first module</p>
                    <button
                      onClick={() => setShowModuleModal(true)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add First Module</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Content */}
            {activeStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Course Media & Content</h2>
                  <p className="text-gray-600">Add thumbnails, videos, and other media</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {/* Course Thumbnail Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Thumbnail *
                      </label>
                      <div className="space-y-3">
                        {/* File Upload */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleThumbnailUpload(e.target.files[0])}
                            className="hidden"
                            id="thumbnail-upload"
                            disabled={uploadingThumbnail}
                          />
                          <label
                            htmlFor="thumbnail-upload"
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            {uploadingThumbnail ? (
                              <>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                <span className="text-sm text-gray-600">Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">
                                  Click to upload thumbnail
                                </span>
                                <span className="text-xs text-gray-500">
                                  PNG, JPG up to 5MB
                                </span>
                              </>
                            )}
                          </label>
                        </div>
                        
                        {/* URL Input Alternative */}
                        <div className="text-center text-gray-500 text-sm">or</div>
                        <input
                          type="text"
                          value={courseData.thumbnail}
                          onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="https://example.com/thumbnail.jpg"
                        />
                        
                        {/* Preview */}
                        {courseData.thumbnail && (
                          <div className="relative">
                            <img
                              src={courseData.thumbnail}
                              alt="Course thumbnail preview"
                              className="w-full h-40 object-cover rounded-lg"
                              onError={() => toast.error('Invalid image URL')}
                            />
                            <button
                              onClick={() => handleInputChange('thumbnail', '')}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preview Video Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Preview Video
                      </label>
                      <div className="space-y-3">
                        {/* File Upload */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handlePreviewVideoUpload(e.target.files[0])}
                            className="hidden"
                            id="preview-video-upload"
                            disabled={uploadingPreview}
                          />
                          <label
                            htmlFor="preview-video-upload"
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            {uploadingPreview ? (
                              <>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                <span className="text-sm text-gray-600">Uploading video...</span>
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-8 h-8 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">
                                  Click to upload preview video
                                </span>
                                <span className="text-xs text-gray-500">
                                  MP4, MOV up to 100MB
                                </span>
                              </>
                            )}
                          </label>
                        </div>
                        
                        {/* URL Input Alternative */}
                        <div className="text-center text-gray-500 text-sm">or</div>
                        <input
                          type="text"
                          value={courseData.previewVideo}
                          onChange={(e) => handleInputChange('previewVideo', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="https://example.com/preview-video.mp4"
                        />
                        
                        {/* Video Preview */}
                        {courseData.previewVideo && (
                          <div className="relative">
                            <video
                              src={courseData.previewVideo}
                              className="w-full h-40 object-cover rounded-lg"
                              controls
                              onError={() => toast.error('Invalid video URL')}
                            />
                            <button
                              onClick={() => handleInputChange('previewVideo', '')}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Course Tags</label>
                      <div className="flex space-x-2 mb-3">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Add a tag"
                        />
                        <button
                          onClick={addTag}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {courseData.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                          >
                            <span>{tag}</span>
                            <button
                              onClick={() => removeTag(tag)}
                              className="text-purple-500 hover:text-purple-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Content Guidelines</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Use high-quality thumbnails (1280x720px recommended)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Keep video previews under 2 minutes</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Add relevant tags to improve discoverability</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Assessment */}
            {activeStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment & Certification</h2>
                  <p className="text-gray-600">Set up quizzes, assignments, and certificates</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-yellow-500" />
                        Certificate Settings
                      </h3>
                      
                      <div className="space-y-4">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={courseData.certificate.isAvailable}
                            onChange={(e) => handleNestedInputChange('certificate', 'isAvailable', e.target.checked)}
                            className="text-purple-600"
                          />
                          <span className="text-gray-700">Offer completion certificate</span>
                        </label>

                        {courseData.certificate.isAvailable && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Score Required</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={courseData.certificate.minimumScore}
                                onChange={(e) => handleNestedInputChange('certificate', 'minimumScore', parseInt(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="70"
                              />
                            </div>

                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={courseData.certificate.completionRequired}
                                onChange={(e) => handleNestedInputChange('certificate', 'completionRequired', e.target.checked)}
                                className="text-purple-600"
                              />
                              <span className="text-gray-700">Require 100% completion</span>
                            </label>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-500" />
                        Default Quiz Settings
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Default Time Limit (minutes)</label>
                          <input
                            type="number"
                            value={newLesson.quiz.timeLimit}
                            onChange={(e) => setNewLesson(prev => ({
                              ...prev,
                              quiz: { ...prev.quiz, timeLimit: parseInt(e.target.value) || 30 }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={newLesson.quiz.passingScore}
                            onChange={(e) => setNewLesson(prev => ({
                              ...prev,
                              quiz: { ...prev.quiz, passingScore: parseInt(e.target.value) || 70 }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Attempts Allowed</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={newLesson.quiz.attemptsAllowed}
                            onChange={(e) => setNewLesson(prev => ({
                              ...prev,
                              quiz: { ...prev.quiz, attemptsAllowed: parseInt(e.target.value) || 3 }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <FileQuestion className="w-5 h-5 mr-2 text-green-500" />
                        Default Assignment Settings
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Score</label>
                          <input
                            type="number"
                            min="1"
                            value={newLesson.assignment.maxScore}
                            onChange={(e) => setNewLesson(prev => ({
                              ...prev,
                              assignment: { ...prev.assignment, maxScore: parseInt(e.target.value) || 100 }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Submission Type</label>
                          <select
                            value={newLesson.assignment.submissionType}
                            onChange={(e) => setNewLesson(prev => ({
                              ...prev,
                              assignment: { ...prev.assignment, submissionType: e.target.value }
                            }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="text">Text Only</option>
                            <option value="file">File Upload Only</option>
                            <option value="both">Text & File Upload</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Assessment Best Practices</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Create quizzes after each major concept</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Include practical assignments for hands-on learning</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Set reasonable time limits for assessments</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Pricing */}
            {activeStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Course Pricing</h2>
                  <p className="text-gray-600">Set your course pricing strategy</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                        <input
                          type="radio"
                          name="pricingType"
                          value="free"
                          checked={courseData.pricing.type === 'free'}
                          onChange={(e) => handleNestedInputChange('pricing', 'type', e.target.value)}
                          className="mb-3 text-purple-600"
                        />
                        <GraduationCap className="w-8 h-8 text-green-500 mb-2" />
                        <span className="font-semibold text-gray-900">Free</span>
                        <span className="text-sm text-gray-600 text-center">Make your course completely free to access</span>
                      </label>

                      <label className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                        <input
                          type="radio"
                          name="pricingType"
                          value="paid"
                          checked={courseData.pricing.type === 'paid'}
                          onChange={(e) => handleNestedInputChange('pricing', 'type', e.target.value)}
                          className="mb-3 text-purple-600"
                        />
                        <DollarSign className="w-8 h-8 text-blue-500 mb-2" />
                        <span className="font-semibold text-gray-900">Paid</span>
                        <span className="text-sm text-gray-600 text-center">Set a fixed price for your course</span>
                      </label>

                      <label className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                        <input
                          type="radio"
                          name="pricingType"
                          value="donation"
                          checked={courseData.pricing.type === 'donation'}
                          onChange={(e) => handleNestedInputChange('pricing', 'type', e.target.value)}
                          className="mb-3 text-purple-600"
                        />
                        <Star className="w-8 h-8 text-yellow-500 mb-2" />
                        <span className="font-semibold text-gray-900">Donation</span>
                        <span className="text-sm text-gray-600 text-center">Accept voluntary donations</span>
                      </label>
                    </div>

                    {courseData.pricing.type === 'paid' && (
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Course Price</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={courseData.price}
                              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="99.00"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price (Optional)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={courseData.discountPrice}
                              onChange={(e) => handleInputChange('discountPrice', parseFloat(e.target.value) || 0)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="79.00"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {courseData.pricing.type === 'donation' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Suggested Donation Amount</label>
                        <div className="relative max-w-xs">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={courseData.pricing.donationSuggested}
                            onChange={(e) => handleNestedInputChange('pricing', 'donationSuggested', parseFloat(e.target.value) || 0)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="25.00"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        value={courseData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD (C$)</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Pricing Strategy Tips</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Free courses can help build your audience and reputation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Consider your course value and time investment</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Donation model works well for charitable educational content</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 6: Settings */}
            {activeStep === 6 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Course Settings</h2>
                  <p className="text-gray-600">Configure advanced options and restrictions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Student Interaction</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <span className="text-gray-700">Allow course discussions</span>
                          <input
                            type="checkbox"
                            checked={courseData.settings.allowDiscussions}
                            onChange={(e) => handleNestedInputChange('settings', 'allowDiscussions', e.target.checked)}
                            className="text-purple-600"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between">
                          <span className="text-gray-700">Allow resource downloads</span>
                          <input
                            type="checkbox"
                            checked={courseData.settings.allowDownloads}
                            onChange={(e) => handleNestedInputChange('settings', 'allowDownloads', e.target.checked)}
                            className="text-purple-600"
                          />
                        </label>
                        
                        <label className="flex items-center justify-between">
                          <span className="text-gray-700">Allow student reviews</span>
                          <input
                            type="checkbox"
                            checked={courseData.settings.allowReviews}
                            onChange={(e) => handleNestedInputChange('settings', 'allowReviews', e.target.checked)}
                            className="text-purple-600"
                          />
                        </label>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Enrollment Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Students (leave empty for unlimited)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={courseData.settings.maxStudents || ''}
                            onChange={(e) => handleNestedInputChange('settings', 'maxStudents', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="100"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enrollment Deadline (optional)
                          </label>
                          <input
                            type="date"
                            value={courseData.settings.enrollmentDeadline}
                            onChange={(e) => handleNestedInputChange('settings', 'enrollmentDeadline', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Course Schedule</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Course Start Date (optional)
                          </label>
                          <input
                            type="date"
                            value={courseData.settings.startDate}
                            onChange={(e) => handleNestedInputChange('settings', 'startDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Course End Date (optional)
                          </label>
                          <input
                            type="date"
                            value={courseData.settings.endDate}
                            onChange={(e) => handleNestedInputChange('settings', 'endDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Student Engagement</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Welcome Message
                          </label>
                          <textarea
                            value={courseData.welcomeMessage || ''}
                            onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Welcome to my course! Here's what you can expect..."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Completion Message
                          </label>
                          <textarea
                            value={courseData.completionMessage || ''}
                            onChange={(e) => handleInputChange('completionMessage', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Congratulations on completing the course! You've learned..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={activeStep === 1}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Step {activeStep} of {steps.length}</span>
              </div>

              <div className="flex items-center space-x-4">
                {activeStep < steps.length ? (
                  <button
                    onClick={nextStep}
                    disabled={!getStepValidation(activeStep)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      getStepValidation(activeStep)
                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Next Step</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      console.log('Create Course button clicked');
                      console.log('Button disabled?', loading || !getStepValidation(activeStep));
                      console.log('Loading:', loading);
                      console.log('Step validation:', getStepValidation(activeStep));
                      console.log('Active step:', activeStep);
                      console.log('Course data modules:', courseData.modules);
                      handleSubmit();
                    }}
                    disabled={loading}
                    className={`flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                      loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-200'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Create Course</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {/* Module Modal */}
          {showModuleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg w-full max-w-md p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Module</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Module Title</label>
                    <input
                      type="text"
                      value={newModule.title}
                      onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Introduction to React"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newModule.description}
                      onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Module description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration (hours)</label>
                    <input
                      type="text"
                      value={newModule.estimatedDuration}
                      onChange={(e) => setNewModule({...newModule, estimatedDuration: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="2.5"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowModuleModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addModule}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add Module
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Lesson Modal */}
          {showLessonModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Lesson</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title</label>
                      <input
                        type="text"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Getting Started with Hooks"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Type</label>
                      <select
                        value={newLesson.type}
                        onChange={(e) => setNewLesson({...newLesson, type: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="video">Video</option>
                        <option value="text">Text/Article</option>
                        <option value="quiz">Quiz</option>
                        <option value="assignment">Assignment</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newLesson.description}
                      onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Lesson description"
                    />
                  </div>

                  {newLesson.type === 'video' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Video Upload</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleLessonVideoUpload(e.target.files[0])}
                            className="hidden"
                            id="lesson-video-upload"
                            disabled={uploadingVideo}
                          />
                          <label
                            htmlFor="lesson-video-upload"
                            className="cursor-pointer flex flex-col items-center space-y-2"
                          >
                            {uploadingVideo ? (
                              <>
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                <span className="text-sm text-gray-600">Uploading video...</span>
                              </>
                            ) : (
                              <>
                                <Video className="w-6 h-6 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">
                                  Click to upload video
                                </span>
                                <span className="text-xs text-gray-500">
                                  MP4, MOV up to 500MB
                                </span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                      
                      <div className="text-center text-gray-500 text-sm">or</div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                          <input
                            type="text"
                            value={newLesson.videoUrl}
                            onChange={(e) => setNewLesson({...newLesson, videoUrl: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="https://example.com/video.mp4"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Duration (seconds)</label>
                          <input
                            type="number"
                            value={newLesson.videoDuration}
                            onChange={(e) => setNewLesson({...newLesson, videoDuration: parseInt(e.target.value) || 0})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="900"
                          />
                        </div>
                      </div>
                      
                      {newLesson.videoUrl && (
                        <div className="relative">
                          <video
                            src={newLesson.videoUrl}
                            className="w-full h-32 object-cover rounded-lg"
                            controls
                            onError={() => toast.error('Invalid video URL')}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {newLesson.type === 'text' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <textarea
                        value={newLesson.content}
                        onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Lesson content in markdown or HTML"
                      />
                    </div>
                  )}

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={newLesson.isPreview}
                      onChange={(e) => setNewLesson({...newLesson, isPreview: e.target.checked})}
                      className="text-purple-600"
                    />
                    <span className="text-gray-700">Allow preview for non-enrolled students</span>
                  </label>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowLessonModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => addLessonToModule(selectedModuleIndex)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add Lesson
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CourseCreate;
