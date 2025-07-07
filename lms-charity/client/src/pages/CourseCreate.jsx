import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { uploadAPI } from '../services/api';
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

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to create courses');
      navigate('/login');
      return;
    }
    
    if (!user) {
      console.log('User not loaded yet...');
      return;
    }
    
    if (user.role !== 'instructor' && user.role !== 'admin') {
      toast.error('Only instructors can create courses');
      navigate('/dashboard');
      return;
    }
    
    console.log('Authentication check passed:', {
      token: !!token,
      user: user,
      role: user.role
    });
  }, [user, navigate]);
  
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
      completionRequirements: {
        watchAllVideos: true,
        completeAllQuizzes: true,
        submitAllAssignments: true,
        minimumQuizScore: 70,
        minimumAssignmentScore: 70,
        participateInDiscussions: false,
        timeBasedCompletion: false,
        minimumTimeSpent: 0 // in minutes
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
    videoThumbnail: '',
    videoUploadTitle: '',
    videoUploadDescription: '',
    content: '',
    resources: [],
    notes: '',
    transcript: '',
    quiz: {
      questions: [],
      timeLimit: 300, // 5 minutes default
      passingScore: 70,
      attemptsAllowed: 3,
      isRequired: false
    },
    assignment: {
      title: '',
      description: '',
      instructions: [],
      maxScore: 100,
      dueDate: '',
      submissionType: 'both',
      isRequired: false
    },
    isPreview: false,
    isCompleted: false,
    completionCriteria: {
      watchTime: 80, // percentage of video to watch
      requireQuizPass: false,
      requireAssignmentSubmission: false
    }
  });
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(null);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState({
    title: '',
    description: '',
    questions: [],
    timeLimit: 300, // 5 minutes default
    passingScore: 70,
    attemptsAllowed: 3,
    isRequired: false,
    showResults: 'after_completion'
  });
  const [currentAssignment, setCurrentAssignment] = useState({
    title: '',
    description: '',
    instructions: [],
    maxScore: 100,
    dueDate: '',
    submissionType: 'both',
    isRequired: false,
    rubric: []
  });

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
      videoUploadTitle: 'Creating Your Course Title and Selecting a Category',
      videoUploadDescription: 'Choosing a compelling title is the first step to attracting the right audience. Your title should be clear, descriptive, and engaging. Make use of keywords related to your subject area to improve discoverability. Selecting the correct category is equally important, as it ensures your course reaches the most relevant audience. Categories help users find your course through filters, so pick one that best matches your course content.',
      notes: [
        'Use tools like ChatGPT to generate course title ideas or keywords',
        'Think about your target audience (e.g., beginners, advanced learners) and tailor the title accordingly',
        'Double-check spelling and grammar for clarity'
      ],
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
      videoUploadTitle: 'Structuring Your Course Curriculum',
      videoUploadDescription: 'Structure your course with a clear outline. Break the content into sections (major themes) and lectures (specific topics). Plan for a smooth progression, starting from basic concepts and gradually moving to advanced topics.',
      notes: [
        'Ensure each lesson has a clear objective that aligns with the overall course goals',
        'Keep videos short and engaging (typically 5–10 minutes per video)',
        'Use videos to explain concepts visually and incorporate quizzes to reinforce learning',
        'Add downloadable resources like PDFs, templates, or slides for further reading'
      ],
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
      videoUploadTitle: 'Adding Videos, Quizzes, and Resources',
      videoUploadDescription: 'Videos are the primary medium for teaching on Udemy. You can upload videos directly through the course creation dashboard. Ensure the videos are of high quality (at least 720p, ideally 1080p for better visuals). Add relevant quizzes and assignments after each section to ensure students engage with the content and test their understanding. Provide downloadable resources such as PDFs, recipes, cheat sheets, etc., to supplement the lessons.',
      notes: [
        'For courses like cooking, record step-by-step processes with clear visuals',
        'Include interactive quizzes at key points to gauge learner understanding',
        'Provide bonus materials like recipe cards, shopping lists, or checklists for better engagement'
      ],
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
      videoUploadTitle: 'Creating an Engaging Course Landing Page',
      videoUploadDescription: 'The course landing page is your sales pitch to potential students. It should clearly describe what the course offers and highlight its key features. Include a promotional video that briefly explains what students will learn and how it will benefit them.',
      notes: [
        'Use a professional profile picture and an informative course description',
        'Showcase your credentials and experience in the course introduction',
        'Highlight the course benefits, such as skills learners will gain and practical applications',
        'Consider offering a sample lesson to provide a preview of the content'
      ],
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
      videoUploadTitle: 'Pricing Your Course and Setting Up Promotions',
      videoUploadDescription: 'Set a competitive price that aligns with the value of your course. Pricing can impact course enrollment, so consider starting with an affordable price and offering discounts through coupons. Promotions are essential for attracting students, especially when starting out. Udemy provides options to create discount coupons to encourage enrollment.',
      notes: [
        'Consider offering free courses or low-cost introductory offers to attract initial students',
        'Use coupons to increase visibility and boost enrollment',
        'Regularly update pricing based on market trends and competition'
      ],
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
      videoUploadTitle: 'Engaging Students with Welcome Messages',
      videoUploadDescription: 'Once students enroll, sending a welcome message is a great way to create a positive first impression and help them feel welcomed and motivated to start the course. Encourage them to ask questions and interact within the course forum.',
      notes: [
        'Introduce yourself and thank students for joining in the welcome message',
        'Provide an overview of what to expect and how to navigate the course',
        'Invite students to leave comments or ask questions in the course discussion area to foster engagement'
      ],
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
      videoUploadTitle: 'Submitting Your Course for Review',
      videoUploadDescription: 'After finalizing your course, submit it for review to ensure it meets Udemy\'s quality standards. Udemy will check the course for content quality, video resolution, and teaching effectiveness. Once approved, your course will be published and available to students worldwide.',
      notes: [
        'Ensure that all course sections are complete with videos, quizzes, and assignments',
        'Double-check your course description, spelling, and grammar for professionalism',
        'Ensure the promotional video clearly communicates the course value'
      ],
      tips: [
        'Review all content for quality',
        'Check grammar and spelling',
        'Ensure promotional video is compelling'
      ]
    },
    { 
      id: 8, 
      title: 'Post-Publication Updates', 
      icon: TrendingUp, 
      description: 'Maintain & update your course after launch',
      motivation: 'Keep your course fresh and engaging for continued success!',
      videoUploadTitle: 'Updating and Maintaining Your Course',
      videoUploadDescription: 'After your course is published, it\'s important to monitor feedback from students and regularly update the content to keep it relevant. Respond to questions, comments, and reviews promptly to maintain a good relationship with students.',
      notes: [
        'Regularly update videos with new content, ensuring they reflect any changes in the industry or teaching methods',
        'Add new sections or more advanced content as needed to keep the course fresh and engaging'
      ],
      tips: [
        'Monitor student feedback regularly',
        'Update content to stay current',
        'Respond to questions promptly'
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
      7: "🚀 You're ready to launch! Your course will impact lives around the world.",
      8: "📈 Keep evolving! Great courses grow with time and feedback."
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
      
      {/* Video Upload Instructions */}
      {step.videoUploadTitle && step.videoUploadDescription && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 mb-4">
          <h4 className="font-semibold text-indigo-900 mb-3 flex items-center">
            <Video className="w-5 h-5 mr-2" />
            {step.videoUploadTitle}
          </h4>
          <p className="text-indigo-800 text-sm leading-relaxed mb-4">
            {step.videoUploadDescription}
          </p>
          {step.notes && step.notes.length > 0 && (
            <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
              <h5 className="font-medium text-indigo-900 mb-2 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Important Notes:
              </h5>
              <ul className="text-indigo-800 text-sm space-y-2">
                {step.notes.map((note, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-indigo-500 mr-2 mt-1">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
          <div className="text-sm text-gray-600 mt-4">
            <p>Course completed with {courseData.certificate.requirements.minimumScore}% minimum score</p>
            <p>Total course completion: {courseData.certificate.requirements.completionPercentage}%</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-300">
          <div className="text-left">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-sm text-gray-600">Instructor</p>
              <p className="font-semibold">{user.name}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 border-2 border-purple-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Certified</p>
          </div>
          <div className="text-right">
            <div className="border-t border-gray-400 pt-2">
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">[Completion Date]</p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {courseData.certificate.template.customMessage}
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
              <Share className="w-4 h-4" />
              <span>Share Certificate</span>
            </button>
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
      // Clean up the lesson data before adding it
      const cleanLesson = {
        ...newLesson,
        id: Date.now(),
        order: courseData.modules[moduleIndex].lessons.length + 1
      };
      
      // Only include quiz if it has actual questions
      if (cleanLesson.quiz && cleanLesson.quiz.questions && cleanLesson.quiz.questions.length === 0) {
        delete cleanLesson.quiz;
      }
      
      // Only include assignment if it has actual title and description
      if (cleanLesson.assignment && 
          (!cleanLesson.assignment.title || !cleanLesson.assignment.title.trim() ||
           !cleanLesson.assignment.description || !cleanLesson.assignment.description.trim())) {
        delete cleanLesson.assignment;
      }
      
      // Also remove empty assignment objects that might have been created by the lesson creation modal
      if (cleanLesson.assignment && 
          cleanLesson.assignment.title === '' && 
          cleanLesson.assignment.description === '') {
        delete cleanLesson.assignment;
      }
      
      console.log('Lesson after cleanup:', {
        title: cleanLesson.title,
        hasQuiz: !!cleanLesson.quiz,
        hasAssignment: !!cleanLesson.assignment,
        quizQuestionsCount: cleanLesson.quiz?.questions?.length || 0,
        assignmentHasTitle: !!cleanLesson.assignment?.title,
        assignmentHasDescription: !!cleanLesson.assignment?.description
      });
      
      setCourseData(prev => ({
        ...prev,
        modules: prev.modules.map((module, index) => 
          index === moduleIndex
            ? {
                ...module,
                lessons: [...module.lessons, cleanLesson]
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
        videoThumbnail: '',
        videoUploadTitle: '',
        videoUploadDescription: '',
        content: '',
        resources: [],
        notes: '',
        transcript: '',
        quiz: {
          questions: [],
          timeLimit: 300, // 5 minutes default
          passingScore: 70,
          attemptsAllowed: 3,
          isRequired: false
        },
        assignment: {
          title: '',
          description: '',
          instructions: [],
          maxScore: 100,
          dueDate: '',
          submissionType: 'both',
          isRequired: false
        },
        isPreview: false,
        isCompleted: false,
        completionCriteria: {
          watchTime: 80,
          requireQuizPass: false,
          requireAssignmentSubmission: false
        }
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
        shortDescription: courseData.shortDescription || '',
        category: courseData.category,
        subcategory: courseData.subcategory || '',
        level: courseData.level,
        thumbnail: {
          url: courseData.thumbnail || '',
          publicId: ''
        },
        previewVideo: {
          url: courseData.previewVideo || '',
          publicId: '',
          duration: 0
        },
        price: courseData.pricing.type === 'free' ? 0 : (courseData.price || 0),
        discountPrice: courseData.discountPrice || 0,
        currency: courseData.currency || 'USD',
        estimatedDuration: courseData.estimatedDuration || '',
        estimatedCompletionTime: courseData.estimatedCompletionTime || '',
        language: courseData.language || 'English',
        tags: courseData.tags || [],
        learningOutcomes: courseData.learningOutcomes.filter(outcome => outcome && outcome.trim()),
        requirements: courseData.requirements.filter(req => req && req.trim()),
        targetAudience: courseData.targetAudience.filter(audience => audience && audience.trim()),
        modules: (courseData.modules || []).map((module, moduleIndex) => ({
          title: module.title,
          description: module.description || '',
          estimatedDuration: parseFloat(module.estimatedDuration) || 0,
          order: module.order || moduleIndex + 1,
          lessons: (module.lessons || []).map((lesson, lessonIndex) => {
            // Ensure lesson type is valid - only allow backend-supported types
            const validLessonTypes = ['video', 'text', 'quiz', 'assignment', 'live'];
            let lessonType = lesson.type || 'video';
            
            // Map any invalid types to 'video' as default
            if (!validLessonTypes.includes(lessonType)) {
              console.warn(`Invalid lesson type "${lessonType}" found, defaulting to "video"`);
              lessonType = 'video';
            }
            
            const lessonData = {
              title: lesson.title,
              description: lesson.description || '',
              type: lessonType,
              content: lesson.content || '',
              videoUrl: lesson.videoUrl || '',
              videoDuration: parseFloat(lesson.videoDuration) || 0,
              order: lesson.order || lessonIndex + 1,
              isPreview: lesson.isPreview || false,
              resources: lesson.resources || []
            };
            
            // Only include quiz if it has valid questions with complete content
            if (lesson.quiz && lesson.quiz.questions && Array.isArray(lesson.quiz.questions) && lesson.quiz.questions.length > 0) {
              // Filter out empty questions and ensure all required fields are present
              const validQuestions = lesson.quiz.questions.filter(q => {
                if (!q || typeof q !== 'object') return false;
                if (!q.question || typeof q.question !== 'string' || !q.question.trim()) return false;
                if (!q.options || !Array.isArray(q.options) || q.options.length < 2) return false;
                return q.options.every(opt => opt && typeof opt === 'string' && opt.trim());
              });
              
              if (validQuestions.length > 0) {
                lessonData.quiz = {
                  questions: validQuestions,
                  timeLimit: lesson.quiz.timeLimit || 30,
                  passingScore: lesson.quiz.passingScore || 70,
                  attemptsAllowed: lesson.quiz.attemptsAllowed || 3,
                  showCorrectAnswers: lesson.quiz.showCorrectAnswers !== false
                };
                console.log(`Including quiz for lesson "${lesson.title}" with ${validQuestions.length} questions`);
              } else {
                console.log(`Excluding quiz for lesson "${lesson.title}" - no valid questions`);
              }
            } else {
              console.log(`No quiz data for lesson "${lesson.title}"`);
            }
            
            // Only include assignment if it has complete required fields AND is not empty
            const hasValidAssignment = lesson.assignment && 
                typeof lesson.assignment === 'object' &&
                lesson.assignment.title && 
                typeof lesson.assignment.title === 'string' && 
                lesson.assignment.title.trim() && 
                lesson.assignment.description && 
                typeof lesson.assignment.description === 'string' && 
                lesson.assignment.description.trim();
            
            if (hasValidAssignment) {
              console.log(`Including assignment for lesson "${lesson.title}":`, {
                title: lesson.assignment.title,
                description: lesson.assignment.description.substring(0, 50) + '...'
              });
              
              lessonData.assignment = {
                title: lesson.assignment.title.trim(),
                description: lesson.assignment.description.trim(),
                instructions: lesson.assignment.instructions || '',
                maxScore: lesson.assignment.maxScore || 100,
                dueDate: lesson.assignment.dueDate || null,
                submissionType: lesson.assignment.submissionType || 'both',
                resources: lesson.assignment.resources || []
              };
            } else {
              // Log why assignment was not included
              if (lesson.assignment && typeof lesson.assignment === 'object') {
                console.log(`Excluding assignment for lesson "${lesson.title}" - missing required fields:`, {
                  hasTitle: !!(lesson.assignment.title && lesson.assignment.title.trim()),
                  hasDescription: !!(lesson.assignment.description && lesson.assignment.description.trim()),
                  titleValue: lesson.assignment.title || '[empty]',
                  descriptionValue: lesson.assignment.description || '[empty]',
                  isEmptyObject: Object.keys(lesson.assignment).length === 0
                });
              } else {
                console.log(`No assignment data for lesson "${lesson.title}"`);
              }
              // Explicitly DO NOT set lessonData.assignment at all
            }
            
            return lessonData;
          }).filter(lesson => {
            // Remove any lessons without titles and ensure no empty assignments
            if (!lesson.title || !lesson.title.trim()) {
              return false;
            }
            
            // Final cleanup: if lesson has an assignment property but it's invalid, remove it
            if (lesson.assignment && 
                (!lesson.assignment.title || !lesson.assignment.title.trim() ||
                 !lesson.assignment.description || !lesson.assignment.description.trim())) {
              console.log(`Final cleanup: removing invalid assignment from lesson "${lesson.title}"`);
              delete lesson.assignment;
            }
            
            return true;
          }) // Remove any lessons without titles
        })).filter(module => module.title && module.title.trim()), // Remove empty modules
        certificate: {
          isAvailable: courseData.certificate?.isAvailable !== false,
          requirements: {
            minimumScore: courseData.certificate?.requirements?.minimumScore || 70,
            completionPercentage: courseData.certificate?.requirements?.completionPercentage || 100
          }
        },
        status: 'draft',
        isPublished: false
      };

      console.log('Submission data prepared:', submissionData);
      console.log('Modules with lessons:', submissionData.modules.map(m => ({
        title: m.title,
        lessons: m.lessons.map(l => ({
          title: l.title,
          type: l.type,
          hasQuiz: !!l.quiz,
          hasAssignment: !!l.assignment,
          quizQuestions: l.quiz?.questions?.length || 0,
          assignmentTitle: l.assignment?.title || 'none',
          assignmentDescription: l.assignment?.description || 'none',
          // Show the exact assignment object structure
          assignmentObject: l.assignment
        }))
      })));
      
      // Also log the exact JSON that will be sent
      console.log('Full submission JSON:', JSON.stringify(submissionData, null, 2));
      console.log('Raw courseData.modules:', courseData.modules.map(m => ({
        title: m.title,
        lessons: m.lessons.map(l => ({
          title: l.title,
          quiz: l.quiz,
          assignment: l.assignment
        }))
      })));
      console.log('Making API call...');

      const response = await axios.post('/api/courses', submissionData, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        baseURL: 'http://localhost:5000'
      });
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
      
      // Log detailed validation errors
      if (error.response?.data?.errors) {
        console.error('Detailed validation errors:', error.response.data.errors);
        error.response.data.errors.forEach((err, index) => {
          console.error(`Validation Error ${index + 1}:`, err);
        });
      }
      
      if (error.response?.data?.details) {
        console.error('Validation details:', error.response.data.details);
      }
      
      // Show detailed error message to user
      let errorMessage = 'Failed to create course';
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.join('; ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
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
        return {
          isValid: courseData.title && courseData.category && courseData.shortDescription,
          errors: [
            !courseData.title && 'Course title is required',
            !courseData.category && 'Category selection is required',
            !courseData.shortDescription && 'Short description is required'
          ].filter(Boolean)
        };
      case 2:
        const hasModules = courseData.modules.length > 0;
        const hasLessonsInModules = courseData.modules.some(module => module.lessons.length > 0);
        return {
          isValid: hasModules && hasLessonsInModules,
          errors: [
            !hasModules && 'At least one module is required',
            !hasLessonsInModules && 'Each module must have at least one lesson',
            ...validateContentStructure()
          ].filter(Boolean)
        };
      case 3:
        const hasBasicContent = courseData.modules.length > 0 && 
                               courseData.modules.some(module => module.lessons.length > 0);
        const hasValidModulesAndLessons = courseData.modules.every(module => 
          module.title && module.title.trim() && 
          module.lessons.every(lesson => lesson.title && lesson.title.trim())
        );
        return {
          isValid: hasBasicContent && hasValidModulesAndLessons,
          errors: [
            !hasBasicContent && 'Please add at least one module with one lesson',
            !hasValidModulesAndLessons && 'All modules and lessons must have titles'
          ].filter(Boolean)
        };
      case 4:
        return {
          isValid: courseData.description && courseData.description.trim(),
          errors: [
            !courseData.description && 'Detailed description is required'
          ].filter(Boolean)
        };
      case 5:
        return {
          isValid: courseData.pricing.type && (courseData.pricing.type === 'free' || courseData.price > 0),
          errors: [
            !courseData.pricing.type && 'Pricing type is required',
            courseData.pricing.type === 'paid' && courseData.price <= 0 && 'Price must be greater than 0 for paid courses'
          ].filter(Boolean)
        };
      case 6:
        return {
          isValid: courseData.settings.welcomeMessage.enabled,
          errors: []
        };
      case 7:
        return {
          isValid: validateFinalSubmission(),
          errors: getFinalValidationErrors()
        };
      default:
        return { isValid: true, errors: [] };
    }
  };

  const validateContentStructure = () => {
    const errors = [];
    courseData.modules.forEach((module, moduleIndex) => {
      if (!module.title) {
        errors.push(`Module ${moduleIndex + 1}: Title is required`);
      }
      if (!module.description) {
        errors.push(`Module ${moduleIndex + 1}: Description is required`);
      }
      if (module.lessons.length === 0) {
        errors.push(`Module ${moduleIndex + 1}: At least one lesson is required`);
      }
      
      module.lessons.forEach((lesson, lessonIndex) => {
        if (!lesson.title) {
          errors.push(`Module ${moduleIndex + 1}, Lesson ${lessonIndex + 1}: Title is required`);
        }
        if (!lesson.videoUploadTitle) {
          errors.push(`Module ${moduleIndex + 1}, Lesson ${lessonIndex + 1}: Video upload title is required`);
        }
        if (!lesson.videoUploadDescription) {
          errors.push(`Module ${moduleIndex + 1}, Lesson ${lessonIndex + 1}: Video upload description is required`);
        }
      });
    });
    return errors;
  };

  const validateContentCompletion = () => {
    // More lenient validation - just check that modules and lessons have basic info
    return courseData.modules.length > 0 && 
           courseData.modules.every(module => 
             module.title && module.title.trim() && 
             module.lessons.length > 0 &&
             module.lessons.every(lesson => lesson.title && lesson.title.trim())
           );
  };

  const getContentValidationErrors = () => {
    const errors = [];
    if (courseData.modules.length === 0) {
      errors.push('Please add at least one module');
      return errors;
    }
    
    courseData.modules.forEach((module, moduleIndex) => {
      if (!module.title || !module.title.trim()) {
        errors.push(`Module ${moduleIndex + 1}: Title is required`);
      }
      if (module.lessons.length === 0) {
        errors.push(`Module ${moduleIndex + 1}: At least one lesson is required`);
      }
      
      module.lessons.forEach((lesson, lessonIndex) => {
        if (!lesson.title || !lesson.title.trim()) {
          errors.push(`Module ${moduleIndex + 1}, Lesson ${lessonIndex + 1}: Title is required`);
        }
      });
    });
    return errors;
  };

  const validateFinalSubmission = () => {
    const validation1 = getStepValidation(1);
    const validation2 = getStepValidation(2);
    const validation3 = getStepValidation(3);
    const validation4 = getStepValidation(4);
    const validation5 = getStepValidation(5);
    
    return validation1.isValid && validation2.isValid && validation3.isValid && 
           validation4.isValid && validation5.isValid;
  };

  const getFinalValidationErrors = () => {
    const allErrors = [];
    for (let i = 1; i <= 6; i++) {
      const validation = getStepValidation(i);
      allErrors.push(...validation.errors);
    }
    return allErrors;
  };

  const calculateCourseCompletion = () => {
    const totalModules = courseData.modules.length;
    const totalLessons = courseData.modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const totalQuizzes = courseData.modules.reduce((acc, module) => 
      acc + module.lessons.reduce((lessonAcc, lesson) => lessonAcc + (lesson.quiz.questions.length > 0 ? 1 : 0), 0), 0
    );
    const totalAssignments = courseData.modules.reduce((acc, module) => 
      acc + module.lessons.reduce((lessonAcc, lesson) => lessonAcc + (lesson.assignment.title ? 1 : 0), 0), 0
    );

    return {
      totalModules,
      totalLessons,
      totalQuizzes,
      totalAssignments,
      estimatedDuration: calculateTotalDuration(),
      completionCriteria: courseData.settings.completionRequirements
    };
  };

  const calculateTotalDuration = () => {
    let totalMinutes = 0;
    courseData.modules.forEach(module => {
      module.lessons.forEach(lesson => {
        if (lesson.videoDuration) {
          const duration = lesson.videoDuration.split(':');
          if (duration.length === 2) {
            totalMinutes += parseInt(duration[0]) * 60 + parseInt(duration[1]);
          }
        }
      });
    });
    return Math.ceil(totalMinutes / 60);
  };

  // Quiz creation functions
  const addQuizQuestion = () => {
    setCurrentQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, {
        id: Date.now(),
        question: '',
        type: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        points: 1
      }]
    }));
  };

  const updateQuizQuestion = (questionIndex, field, value) => {
    setCurrentQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateQuizQuestionOption = (questionIndex, optionIndex, value) => {
    setCurrentQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === questionIndex 
          ? { ...q, options: q.options.map((opt, oIndex) => oIndex === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  const removeQuizQuestion = (questionIndex) => {
    setCurrentQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, index) => index !== questionIndex)
    }));
  };

  const addQuizToLesson = (moduleIndex, lessonIndex) => {
    if (currentQuiz.questions.length === 0) {
      toast.error('Please add at least one question to the quiz');
      return;
    }

    // Validate that all questions have content
    const invalidQuestions = currentQuiz.questions.filter(q => 
      !q.question || !q.question.trim() || 
      !q.options || q.options.length < 2 || 
      q.options.some(opt => !opt || !opt.trim())
    );

    if (invalidQuestions.length > 0) {
      toast.error('Please complete all quiz questions with valid options');
      return;
    }

    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, mIndex) => 
        mIndex === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, lIndex) => 
                lIndex === lessonIndex
                  ? { ...lesson, quiz: { ...currentQuiz } }
                  : lesson
              )
            }
          : module
      )
    }));

    setCurrentQuiz({
      title: '',
      description: '',
      questions: [],
      timeLimit: 300, // 5 minutes default
      passingScore: 70,
      attemptsAllowed: 3,
      isRequired: false,
      showResults: 'after_completion'
    });
    
    setShowQuizModal(false);
    toast.success('Quiz updated successfully!');
  };

  // Assignment creation functions
  const addAssignmentRubricCriteria = () => {
    setCurrentAssignment(prev => ({
      ...prev,
      rubric: [...prev.rubric, {
        id: Date.now(),
        criteria: '',
        description: '',
        points: 10,
        levels: [
          { name: 'Excellent', points: 10, description: '' },
          { name: 'Good', points: 8, description: '' },
          { name: 'Fair', points: 6, description: '' },
          { name: 'Poor', points: 4, description: '' }
        ]
      }]
    }));
  };

  const updateAssignmentRubric = (rubricIndex, field, value) => {
    setCurrentAssignment(prev => ({
      ...prev,
      rubric: prev.rubric.map((r, index) => 
        index === rubricIndex ? { ...r, [field]: value } : r
      )
    }));
  };

  const removeAssignmentRubric = (rubricIndex) => {
    setCurrentAssignment(prev => ({
      ...prev,
      rubric: prev.rubric.filter((_, index) => index !== rubricIndex)
    }));
  };

  const addAssignmentToLesson = (moduleIndex, lessonIndex) => {
    if (!currentAssignment.title || !currentAssignment.description) {
      toast.error('Please fill in the assignment title and description');
      return;
    }

    if (!currentAssignment.title.trim() || !currentAssignment.description.trim()) {
      toast.error('Assignment title and description cannot be empty');
      return;
    }

    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, mIndex) => 
        mIndex === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, lIndex) => 
                lIndex === lessonIndex
                  ? { ...lesson, assignment: { ...currentAssignment } }
                  : lesson
              )
            }
          : module
      )
    }));

    setCurrentAssignment({
      title: '',
      description: '',
      instructions: [],
      maxScore: 100,
      dueDate: '',
      submissionType: 'both',
      isRequired: false,
      rubric: []
    });
    
    setShowAssignmentModal(false);
    toast.success('Assignment updated successfully!');
  };

  // Utility function to compress images
  const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate new dimensions
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
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              // Create a new File object with original filename
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

  // Utility function to check if compression is needed
  const needsCompression = (file, maxSize = 10 * 1024 * 1024) => {
    return file.size > maxSize;
  };

  // Utility function to show file size info
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Utility function to get compression tips
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

  const handleThumbnailUpload = async (file) => {
    if (!file) return;
    
    // Check if it's an image file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    setUploadingThumbnail(true);
    
    try {
      let fileToUpload = file;
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      // Show original file size
      console.log(`Original file size: ${formatFileSize(file.size)}`);
      
      // Check if compression is needed
      if (needsCompression(file, maxSize)) {
        const loadingToast = toast.loading('Compressing image...');
        
        try {
          // Compress the image
          const compressedFile = await compressImage(file, 1920, 1080, 0.8);
          
          console.log(`Compressed file size: ${formatFileSize(compressedFile.size)}`);
          
          // Check if compression was successful
          if (compressedFile.size < maxSize) {
            fileToUpload = compressedFile;
            toast.dismiss(loadingToast);
            toast.success(`Image compressed from ${formatFileSize(file.size)} to ${formatFileSize(compressedFile.size)}`);
          } else {
            // Try more aggressive compression
            toast.dismiss(loadingToast);
            const moreCompressedToast = toast.loading('Applying stronger compression...');
            
            const moreCompressed = await compressImage(file, 1280, 720, 0.6);
            
            if (moreCompressed.size < maxSize) {
              fileToUpload = moreCompressed;
              toast.dismiss(moreCompressedToast);
              toast.success(`Image compressed from ${formatFileSize(file.size)} to ${formatFileSize(moreCompressed.size)}`);
            } else {
              toast.dismiss(moreCompressedToast);
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
      
      // Create configured axios instance
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to upload files');
        return;
      }
      
      console.log('User role:', user?.role);
      console.log('Token exists:', !!token);
      console.log('User object:', user);
      
      const response = await axios.post('/api/courses/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
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
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 403) {
        console.error('403 Forbidden - Auth issue detected');
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to upload thumbnail');
      }
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handlePreviewVideoUpload = async (file) => {
    if (!file) return;
    
    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    // Show file size info
    console.log(`Video file size: ${formatFileSize(file.size)}`);
    
    if (file.size > maxSize) {
      const tips = getCompressionTips(file.type);
      toast.error(
        `Video file size (${formatFileSize(file.size)}) exceeds the 10MB limit. 
        
        Try these compression tips:
        ${tips.slice(0, 3).map(tip => `• ${tip}`).join('\n')}
        
        Or upgrade your Cloudinary plan for larger files.`
      );
      return;
    }
    
    setUploadingPreview(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video');
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to upload files');
        return;
      }
      
      const response = await axios.post('/api/courses/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
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
    
    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    // Show file size info
    console.log(`Lesson video file size: ${formatFileSize(file.size)}`);
    
    if (file.size > maxSize) {
      const tips = getCompressionTips(file.type);
      toast.error(
        `Video file size (${formatFileSize(file.size)}) exceeds the 10MB limit. 
        
        Try these compression tips:
        ${tips.slice(0, 4).map(tip => `• ${tip}`).join('\n')}
        
        Or upgrade your Cloudinary plan for larger files.`
      );
      return;
    }
    
    setUploadingVideo(true);
    
    try {
      console.log('=== VIDEO UPLOAD DEBUG ===');
      console.log('File:', file);
      console.log('User:', user);
      console.log('User role:', user?.role);
      
      // Try using the uploadAPI service first
      try {
        console.log('Attempting upload via uploadAPI service...');
        const result = await uploadAPI.uploadFile(file, 'video');
        console.log('UploadAPI result:', result);
        
        setNewLesson(prev => ({
          ...prev,
          videoUrl: result.url,
          videoDuration: result.duration || 0
        }));
        
        toast.success('Video uploaded successfully!');
        return;
      } catch (uploadAPIError) {
        console.error('UploadAPI failed:', uploadAPIError);
        console.log('Falling back to direct API call...');
      }
      
      // Fallback to direct API call
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video');
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to upload files');
        return;
      }
      
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      // Test the auth endpoint first
      try {
        const authTest = await axios.get('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          baseURL: 'http://localhost:5000'
        });
        console.log('Auth test successful:', authTest.data);
      } catch (authError) {
        console.error('Auth test failed:', authError.response?.status, authError.response?.data);
        if (authError.response?.status === 403 || authError.response?.status === 401) {
          console.error('Auth test failed with 403/401 - token is invalid');
          toast.error('Your session has expired. Please login again.');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
      }
      
      console.log('=== PROCEEDING WITH DIRECT UPLOAD ===');
      
      const response = await axios.post('/api/courses/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
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
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 403) {
        console.error('403 Forbidden - Auth issue detected');
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 401) {
        console.error('401 Unauthorized - Token invalid');
        toast.error('Your session has expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to upload video');
      }
    } finally {
      setUploadingVideo(false);
    }
  };

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to create courses');
      navigate('/login');
      return;
    }
    
    if (!user) {
      console.log('User not loaded yet...');
      return;
    }
    
    if (user.role !== 'instructor' && user.role !== 'admin') {
      toast.error('Only instructors can create courses');
      navigate('/dashboard');
      return;
    }
    
    console.log('Authentication check passed:', {
      token: !!token,
      user: user,
      role: user.role
    });
  }, [user, navigate]);

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
              const isValid = getStepValidation(step.id).isValid;
              
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
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={audience}
                          onChange={(e) => handleArrayInputChange('targetAudience', index, e.target.value)}
                          placeholder={`Who should take this course? (e.g., "Beginners in programming")`}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {courseData.targetAudience.length > 1 && (
                          <button
                            onClick={() => removeArrayItem('targetAudience', index)}
                            className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
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
                  
                  {/* Course Statistics */}
                  {courseData.modules.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{courseData.modules.length}</div>
                        <div className="text-sm text-blue-700">Modules</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {courseData.modules.reduce((acc, module) => acc + module.lessons.length, 0)}
                        </div>
                        <div className="text-sm text-green-700">Lessons</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {courseData.modules.reduce((acc, module) => 
                            acc + module.lessons.reduce((lessonAcc, lesson) => 
                              lessonAcc + (lesson.quiz && lesson.quiz.questions.length > 0 ? 1 : 0), 0), 0
                          )}
                        </div>
                        <div className="text-sm text-purple-700">Quizzes</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {courseData.modules.reduce((acc, module) => 
                            acc + module.lessons.reduce((lessonAcc, lesson) => 
                              lessonAcc + (lesson.assignment && lesson.assignment.title ? 1 : 0), 0), 0
                          )}
                        </div>
                        <div className="text-sm text-orange-700">Assignments</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">
                          {Math.ceil(courseData.modules.reduce((acc, module) => 
                            acc + module.lessons.reduce((lessonAcc, lesson) => 
                              lessonAcc + (lesson.videoDuration ? parseInt(lesson.videoDuration.split(':')[0] || 0) : 0), 0), 0
                          ) / 60)}h
                        </div>
                        <div className="text-sm text-gray-700">Duration</div>
                      </div>
                    </div>
                  )}
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
                                    {lesson.quiz && lesson.quiz.questions.length > 0 && (
                                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                        Quiz ({lesson.quiz.questions.length} Q)
                                      </span>
                                    )}
                                    {lesson.assignment && lesson.assignment.title && (
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                        Assignment
                                      </span>
                                    )}
                                    {lesson.isPreview && (
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Preview</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {/* Show Quiz button only if lesson has quiz enabled */}
                                {lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0 && (
                                  <button
                                    onClick={() => {
                                      setSelectedModuleIndex(moduleIndex);
                                      setSelectedLessonIndex(lessonIndex);
                                      setCurrentQuiz(lesson.quiz);
                                      setShowQuizModal(true);
                                    }}
                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                    title="Edit Quiz"
                                  >
                                    <Brain className="w-4 h-4" />
                                  </button>
                                )}
                                {/* Show Assignment button only if lesson has assignment enabled */}
                                {lesson.assignment && lesson.assignment.title && lesson.assignment.title.trim() !== '' && (
                                  <button
                                    onClick={() => {
                                      setSelectedModuleIndex(moduleIndex);
                                      setSelectedLessonIndex(lessonIndex);
                                      setCurrentAssignment(lesson.assignment);
                                      setShowAssignmentModal(true);
                                    }}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Edit Assignment"
                                  >
                                    <FileQuestion className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => removeLessonFromModule(moduleIndex, lesson.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Lesson"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
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
                    disabled={!getStepValidation(activeStep).isValid}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      getStepValidation(activeStep).isValid
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
                      console.log('Button disabled?', loading || !getStepValidation(activeStep).isValid);
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
        </AnimatePresence>

        {/* Modals */}
        <LessonCreationModal
          isOpen={showLessonModal}
          onClose={() => setShowLessonModal(false)}
          moduleIndex={selectedModuleIndex}
          newLesson={newLesson}
          setNewLesson={setNewLesson}
          addLessonToModule={addLessonToModule}
          handleLessonVideoUpload={handleLessonVideoUpload}
          uploadingVideo={uploadingVideo}
        />

        <CompletionRequirementsModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          courseData={courseData}
          handleNestedInputChange={handleNestedInputChange}
        />

        {/* Quiz Modal */}
        {showQuizModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Create Quiz</h3>
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Quiz Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
                    <input
                      type="text"
                      value={currentQuiz.title}
                      onChange={(e) => setCurrentQuiz({...currentQuiz, title: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Introduction Quiz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
                    <input
                      type="number"
                      value={currentQuiz.timeLimit}
                      onChange={(e) => setCurrentQuiz({...currentQuiz, timeLimit: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Quiz Questions */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Questions</h4>
                    <button
                      onClick={addQuizQuestion}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Question</span>
                    </button>
                  </div>
                  
                  {currentQuiz.questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-600">Question {index + 1}</span>
                        <button
                          onClick={() => removeQuizQuestion(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuizQuestion(index, 'question', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                        placeholder="Enter your question"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`question-${index}`}
                              checked={question.correctAnswer === optIndex}
                              onChange={() => updateQuizQuestion(index, 'correctAnswer', optIndex)}
                              className="text-purple-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateQuizQuestionOption(index, optIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder={`Option ${optIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addQuizToLesson(selectedModuleIndex, selectedLessonIndex)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {currentQuiz.title ? 'Update Quiz' : 'Add Quiz'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Assignment Modal */}
        {showAssignmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Create Assignment</h3>
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Assignment Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
                  <input
                    type="text"
                    value={currentAssignment.title}
                    onChange={(e) => setCurrentAssignment({...currentAssignment, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Practice Exercise"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={currentAssignment.description}
                    onChange={(e) => setCurrentAssignment({...currentAssignment, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe what students need to do"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Score</label>
                    <input
                      type="number"
                      value={currentAssignment.maxScore}
                      onChange={(e) => setCurrentAssignment({...currentAssignment, maxScore: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Submission Type</label>
                    <select
                      value={currentAssignment.submissionType}
                      onChange={(e) => setCurrentAssignment({...currentAssignment, submissionType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="text">Text</option>
                      <option value="file">File Upload</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addAssignmentToLesson(selectedModuleIndex, selectedLessonIndex)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {currentAssignment.title ? 'Update Assignment' : 'Add Assignment'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showCertificatePreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Certificate Preview</h3>
                <button
                  onClick={() => setShowCertificatePreview(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <CertificatePreview />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCreate;
