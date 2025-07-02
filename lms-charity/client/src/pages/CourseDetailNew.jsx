import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  BookOpen,
  Users,
  Clock,
  Star,
  Heart,
  Bookmark,
  Share2,
  Download,
  CheckCircle,
  Target,
  Award,
  MessageSquare,
  Calendar,
  FileText,
  Video,
  Brain,
  Globe,
  Shield,
  TrendingUp,
  User,
  ChevronRight,
  ChevronDown,
  Info,
  Lock,
  PlayCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CourseDetailNew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModules, setExpandedModules] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);

  // Mock data - replace with API call
  useEffect(() => {
    setTimeout(() => {
      setCourse({
        _id: id,
        title: 'Complete React Development Masterclass 2024',
        shortDescription: 'Master React, Redux, Hooks, Context API, and modern development practices',
        description: 'This comprehensive React course will take you from beginner to advanced level. You\'ll learn React fundamentals, state management with Redux, modern hooks, context API, testing, and deployment strategies. Build real-world projects and gain the skills needed for professional React development.',
        category: 'Programming',
        subcategory: 'Frontend Development',
        level: 'Intermediate',
        difficulty: 'Medium',
        language: 'English',
        subtitles: ['English', 'Spanish', 'French'],
        instructor: {
          name: 'John Smith',
          avatar: '',
          bio: 'Senior Full-Stack Developer with 8+ years of experience. Former Google engineer and React specialist.',
          rating: 4.9,
          students: 45000,
          courses: 12
        },
        thumbnail: '',
        previewVideo: {
          url: 'https://example.com/preview.mp4',
          duration: 180
        },
        price: 89.99,
        discountPrice: 59.99,
        currency: 'USD',
        duration: 42.5,
        estimatedCompletionTime: '6-8 weeks at 4-5 hours/week',
        totalLessons: 156,
        totalStudents: 12450,
        rating: {
          average: 4.8,
          count: 2341,
          distribution: {
            5: 1876,
            4: 341,
            3: 87,
            2: 25,
            1: 12
          }
        },
        lastUpdated: '2024-01-15',
        publishedAt: '2023-06-01',
        tags: ['React', 'JavaScript', 'Frontend', 'Web Development', 'Redux', 'Hooks'],
        requirements: [
          'Basic knowledge of HTML, CSS, and JavaScript',
          'Familiarity with ES6+ syntax',
          'Computer with internet connection',
          'Code editor (VS Code recommended)'
        ],
        learningOutcomes: [
          'Build modern React applications from scratch',
          'Master React Hooks and Context API',
          'Implement state management with Redux Toolkit',
          'Create responsive and interactive user interfaces',
          'Test React components and applications',
          'Deploy React applications to production',
          'Understand React best practices and patterns',
          'Work with external APIs and data fetching'
        ],
        targetAudience: [
          'JavaScript developers wanting to learn React',
          'Frontend developers looking to advance their skills',
          'Full-stack developers wanting to master modern React',
          'Computer science students and bootcamp graduates'
        ],
        modules: [
          {
            _id: 'mod1',
            title: 'Getting Started with React',
            description: 'Introduction to React, setup, and fundamental concepts',
            order: 1,
            estimatedDuration: 8,
            lessons: [
              {
                _id: 'lesson1',
                title: 'What is React and Why Use It?',
                description: 'Understanding React, its benefits, and ecosystem',
                order: 1,
                type: 'video',
                videoDuration: 1800,
                isPreview: true,
                isPublished: true
              },
              {
                _id: 'lesson2',
                title: 'Setting Up Development Environment',
                description: 'Installing Node.js, Create React App, and essential tools',
                order: 2,
                type: 'video',
                videoDuration: 1200,
                isPreview: false,
                isPublished: true
              },
              {
                _id: 'lesson3',
                title: 'Your First React Component',
                description: 'Creating and understanding React components',
                order: 3,
                type: 'video',
                videoDuration: 2100,
                isPreview: false,
                isPublished: true
              },
              {
                _id: 'lesson4',
                title: 'Quiz: React Fundamentals',
                description: 'Test your understanding of React basics',
                order: 4,
                type: 'quiz',
                isPreview: false,
                isPublished: true,
                quiz: {
                  questions: 10,
                  timeLimit: 30,
                  passingScore: 70
                }
              }
            ]
          },
          {
            _id: 'mod2',
            title: 'JSX and Components Deep Dive',
            description: 'Advanced JSX syntax, component patterns, and props',
            order: 2,
            estimatedDuration: 12,
            lessons: [
              {
                _id: 'lesson5',
                title: 'JSX Syntax and Best Practices',
                description: 'Mastering JSX expressions, conditional rendering, and lists',
                order: 1,
                type: 'video',
                videoDuration: 2400,
                isPreview: false,
                isPublished: true
              },
              {
                _id: 'lesson6',
                title: 'Props and Component Communication',
                description: 'Passing data between components effectively',
                order: 2,
                type: 'video',
                videoDuration: 1800,
                isPreview: false,
                isPublished: true
              },
              {
                _id: 'lesson7',
                title: 'Assignment: Build a Product Card Component',
                description: 'Create a reusable product card with props',
                order: 3,
                type: 'assignment',
                isPreview: false,
                isPublished: true,
                assignment: {
                  title: 'Product Card Component',
                  maxScore: 100,
                  dueDate: '2024-02-01'
                }
              }
            ]
          },
          {
            _id: 'mod3',
            title: 'State Management and Hooks',
            description: 'useState, useEffect, and custom hooks',
            order: 3,
            estimatedDuration: 15,
            lessons: [
              {
                _id: 'lesson8',
                title: 'Understanding React State',
                description: 'Managing component state with useState hook',
                order: 1,
                type: 'video',
                videoDuration: 2700,
                isPreview: false,
                isPublished: true
              }
            ]
          }
        ],
        certificate: {
          isAvailable: true,
          requirements: {
            minimumScore: 80,
            completionPercentage: 100
          }
        },
        reviews: [
          {
            _id: 'rev1',
            user: {
              name: 'Sarah Johnson',
              avatar: ''
            },
            rating: 5,
            comment: 'Excellent course! Very comprehensive and well-structured. The instructor explains complex concepts clearly.',
            createdAt: '2024-01-10',
            helpfulVotes: 23,
            isVerifiedPurchase: true
          },
          {
            _id: 'rev2',
            user: {
              name: 'Mike Chen',
              avatar: ''
            },
            rating: 5,
            comment: 'Best React course I\'ve taken. Projects are practical and relevant to real-world development.',
            createdAt: '2024-01-08',
            helpfulVotes: 18,
            isVerifiedPurchase: true
          }
        ],
        discussions: [
          {
            _id: 'disc1',
            title: 'Help with useEffect cleanup',
            category: 'question',
            author: { name: 'Alex Rivera' },
            replies: 5,
            lastActivity: '2 hours ago',
            views: 23
          },
          {
            _id: 'disc2',
            title: 'Course Materials Updated',
            category: 'announcement',
            author: { name: 'John Smith' },
            replies: 12,
            lastActivity: '1 day ago',
            views: 156
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll');
      navigate('/login');
      return;
    }

    setEnrollmentLoading(true);
    // Simulate enrollment API call
    setTimeout(() => {
      setIsEnrolled(true);
      setEnrollmentLoading(false);
      toast.success('Successfully enrolled! Welcome to the course.');
    }, 2000);
  };

  const handleWishlist = () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  {course.category}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  {course.level}
                </span>
              </div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold mb-4 leading-tight"
              >
                {course.title}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-blue-100 mb-6 leading-relaxed"
              >
                {course.shortDescription}
              </motion.p>

              {/* Course Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-6 mb-6"
              >
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                  <span className="font-semibold">{course.rating.average}</span>
                  <span className="text-blue-200 ml-1">({course.rating.count} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-300 mr-2" />
                  <span>{course.totalStudents.toLocaleString()} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-300 mr-2" />
                  <span>{course.duration} hours</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-blue-300 mr-2" />
                  <span>{course.language}</span>
                </div>
              </motion.div>

              {/* Instructor Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-4"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  {course.instructor.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">Instructor: {course.instructor.name}</p>
                  <p className="text-blue-200 text-sm">{course.instructor.students.toLocaleString()} students • {course.instructor.courses} courses</p>
                </div>
              </motion.div>
            </div>

            {/* Course Card */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sticky top-8"
              >
                {/* Preview Video */}
                <div className="relative mb-6 group cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <PlayCircle className="h-16 w-16 text-white group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    Preview {formatDuration(course.previewVideo.duration)}
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${course.discountPrice}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      ${course.price}
                    </span>
                    <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full text-sm font-medium">
                      {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Offer expires in 2 days
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                  {isEnrolled ? (
                    <button
                      onClick={() => navigate(`/courses/${course._id}/learn`)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Go to Course
                    </button>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrollmentLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center"
                    >
                      {enrollmentLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                      ) : (
                        <Award className="h-5 w-5 mr-2" />
                      )}
                      {enrollmentLoading ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleWishlist}
                      className={`flex items-center justify-center py-3 px-4 rounded-xl border transition-colors ${
                        isWishlisted
                          ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Heart className={`h-5 w-5 mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                      Wishlist
                    </button>
                    
                    <button className="flex items-center justify-center py-3 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                      <Share2 className="h-5 w-5 mr-2" />
                      Share
                    </button>
                  </div>
                </div>

                {/* Course Includes */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">This course includes:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Video className="h-5 w-5 text-blue-500 mr-3" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{course.duration} hours on-demand video</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-green-500 mr-3" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Downloadable resources</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-purple-500 mr-3" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Certificate of completion</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-orange-500 mr-3" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Full lifetime access</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2">
            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-8">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: Info },
                    { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
                    { id: 'reviews', label: 'Reviews', icon: Star },
                    { id: 'discussions', label: 'Discussions', icon: MessageSquare }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <OverviewTab course={course} />
                    </motion.div>
                  )}

                  {activeTab === 'curriculum' && (
                    <motion.div
                      key="curriculum"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CurriculumTab 
                        modules={course.modules} 
                        expandedModules={expandedModules}
                        toggleModule={toggleModule}
                        isEnrolled={isEnrolled}
                        formatDuration={formatDuration}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ReviewsTab course={course} />
                    </motion.div>
                  )}

                  {activeTab === 'discussions' && (
                    <motion.div
                      key="discussions"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DiscussionsTab discussions={course.discussions} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            {/* Instructor Info */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                About the Instructor
              </h3>
              
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {course.instructor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {course.instructor.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {course.instructor.bio}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center text-yellow-500 mb-1">
                        <Star className="h-4 w-4 fill-current mr-1" />
                        <span className="font-medium">{course.instructor.rating}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">Instructor Rating</p>
                    </div>
                    <div>
                      <div className="flex items-center text-blue-500 mb-1">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="font-medium">{course.instructor.students.toLocaleString()}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">Students</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Features */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Course Features
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Duration</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {course.duration} hours
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Lessons</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {course.totalLessons}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-purple-500 mr-3" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Level</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {course.level}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-yellow-500 mr-3" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Certificate</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Yes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab = ({ course }) => {
  return (
    <div className="space-y-8">
      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          About this course
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {course.description}
        </p>
      </div>

      {/* Learning Outcomes */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          What you'll learn
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {course.learningOutcomes.map((outcome, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-300">{outcome}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Requirements
        </h3>
        <ul className="space-y-2">
          {course.requirements.map((requirement, index) => (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-300">{requirement}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Target Audience */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Who this course is for
        </h3>
        <ul className="space-y-2">
          {course.targetAudience.map((audience, index) => (
            <li key={index} className="flex items-start">
              <Target className="h-5 w-5 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-300">{audience}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const CurriculumTab = ({ modules, expandedModules, toggleModule, isEnrolled, formatDuration }) => {
  const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const totalDuration = modules.reduce((acc, module) => 
    acc + module.lessons.reduce((lessonAcc, lesson) => 
      lessonAcc + (lesson.videoDuration || 0), 0), 0);

  return (
    <div className="space-y-6">
      {/* Curriculum Overview */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-300">
              Course Content
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              {modules.length} sections • {totalLessons} lectures • {formatDuration(totalDuration)} total length
            </p>
          </div>
          <BookOpen className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {modules.map((module, moduleIndex) => (
          <div 
            key={module._id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            {/* Module Header */}
            <button
              onClick={() => toggleModule(module._id)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center text-left">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                  {moduleIndex + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {module.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {module.lessons.length} lessons • {module.estimatedDuration}h
                  </p>
                </div>
              </div>
              <ChevronDown 
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  expandedModules[module._id] ? 'transform rotate-180' : ''
                }`} 
              />
            </button>

            {/* Module Lessons */}
            <AnimatePresence>
              {expandedModules[module._id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div 
                        key={lesson._id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            {/* Lesson Icon */}
                            <div className="flex-shrink-0 mr-3">
                              {lesson.type === 'video' ? (
                                <Play className="h-5 w-5 text-blue-500" />
                              ) : lesson.type === 'quiz' ? (
                                <Brain className="h-5 w-5 text-purple-500" />
                              ) : lesson.type === 'assignment' ? (
                                <FileText className="h-5 w-5 text-green-500" />
                              ) : (
                                <BookOpen className="h-5 w-5 text-gray-500" />
                              )}
                            </div>

                            {/* Lesson Info */}
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h5 className="font-medium text-gray-900 dark:text-white">
                                  {lesson.title}
                                </h5>
                                {lesson.isPreview && (
                                  <span className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                                    Preview
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {lesson.description}
                              </p>
                            </div>
                          </div>

                          {/* Lesson Duration/Info */}
                          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                            {lesson.type === 'video' && lesson.videoDuration && (
                              <span>{formatDuration(lesson.videoDuration)}</span>
                            )}
                            {lesson.type === 'quiz' && lesson.quiz && (
                              <span>{lesson.quiz.questions} questions</span>
                            )}
                            {!isEnrolled && !lesson.isPreview && (
                              <Lock className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReviewsTab = ({ course }) => {
  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {course.rating.average}
            </div>
            <div className="flex items-center justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-6 w-6 ${
                    i < Math.floor(course.rating.average) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300 dark:text-gray-600'
                  }`} 
                />
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {course.rating.count} reviews
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <span className="text-sm w-4">{rating}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-current mx-2" />
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ 
                      width: `${(course.rating.distribution[rating] / course.rating.count) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 w-8">
                  {Math.round((course.rating.distribution[rating] / course.rating.count) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-6">
        {course.reviews.map((review) => (
          <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {review.user.name.charAt(0)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {review.user.name}
                    </h4>
                    <div className="flex items-center">
                      <div className="flex items-center mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < review.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300 dark:text-gray-600'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {review.createdAt}
                      </span>
                    </div>
                  </div>
                  
                  {review.isVerifiedPurchase && (
                    <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                      Verified Purchase
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {review.comment}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <button className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <Heart className="h-4 w-4 mr-1" />
                    Helpful ({review.helpfulVotes})
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DiscussionsTab = ({ discussions }) => {
  return (
    <div className="space-y-6">
      {/* Discussion Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Course Discussions
        </h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Start Discussion
        </button>
      </div>

      {/* Discussion List */}
      <div className="space-y-4">
        {discussions.map((discussion) => (
          <div 
            key={discussion._id}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    discussion.category === 'announcement' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    discussion.category === 'question' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {discussion.category}
                  </span>
                </div>
                
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {discussion.title}
                </h4>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  by {discussion.author.name}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {discussion.replies} replies
                  </span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {discussion.views} views
                  </span>
                  <span>{discussion.lastActivity}</span>
                </div>
              </div>
              
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetailNew;
