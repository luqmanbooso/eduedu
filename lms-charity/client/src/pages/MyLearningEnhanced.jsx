import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Award, 
  Star, 
  Filter, 
  Search, 
  Grid, 
  List, 
  Download,
  Share2,
  MoreVertical,
  CheckCircle,
  PlayCircle,
  BarChart,
  Calendar,
  Target,
  TrendingUp,
  BookmarkPlus,
  Eye,
  BarChart3,
  Trophy,
  Flame,
  ChevronRight,
  Users,
  Globe,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { courseAPI, progressAPI, enrollmentAPI, wishlistAPI, certificateAPI } from '../services/api';
import RatingModal from '../components/RatingModal';
import toast from 'react-hot-toast';

const MyLearningEnhanced = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [wishlistedCourses, setWishlistedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('learning');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedCourseForRating, setSelectedCourseForRating] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMyLearningData();
    }
  }, [user]);

  const fetchMyLearningData = async () => {
    try {
      setLoading(true);
      
      console.log('=== Fetching My Learning Data ===');
      
      // First, clean up any orphaned progress records
      try {
        const cleanupResponse = await progressAPI.cleanupProgress();
        console.log('Cleanup response:', cleanupResponse);
      } catch (cleanupError) {
        console.error('Cleanup error (non-fatal):', cleanupError);
      }
      
      // Fetch enrolled courses with progress
      const enrolledResponse = await enrollmentAPI.getEnrolledCourses();
      console.log('Enrolled courses response:', enrolledResponse);
      console.log('Enrolled courses count:', enrolledResponse.data?.length || 0);
      setEnrolledCourses(enrolledResponse.data || []);
      
      // Fetch completed courses
      const completedResponse = await enrollmentAPI.getCompletedCourses();
      console.log('Completed courses response:', completedResponse);
      console.log('Completed courses count:', completedResponse.data?.length || 0);
      setCompletedCourses(completedResponse.data || []);
      
      // Fetch wishlisted courses
      const wishlistResponse = await wishlistAPI.getWishlist();
      console.log('Wishlist response:', wishlistResponse);
      console.log('Wishlist count:', wishlistResponse.data?.length || 0);
      setWishlistedCourses(wishlistResponse.data || []);
      
      // Additional debugging - let's also check analytics
      try {
        const analyticsResponse = await progressAPI.getAnalytics();
        console.log('Analytics response:', analyticsResponse);
        console.log('Analytics total courses:', analyticsResponse.data?.totalCourses || 0);
      } catch (analyticsError) {
        console.error('Analytics error:', analyticsError);
      }
      
    } catch (error) {
      console.error('Error fetching learning data:', error);
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (ratingData) => {
    try {
      await courseAPI.rateCourse(selectedCourseForRating.courseId || selectedCourseForRating._id, ratingData);
      toast.success('Thank you for rating this course!');
      setShowRatingModal(false);
      setSelectedCourseForRating(null);
    } catch (error) {
      console.error('Rating error:', error);
      toast.error('Failed to submit rating. You may have already rated this course.');
    }
  };

  const handleCourseRating = (course) => {
    setSelectedCourseForRating(course);
    setShowRatingModal(true);
  };

  const getFilteredCourses = () => {
    let courses = [];
    
    switch (activeTab) {
      case 'learning':
        courses = enrolledCourses.filter(course => course.progress?.percentage < 100);
        break;
      case 'completed':
        courses = completedCourses;
        break;
      case 'wishlist':
        courses = wishlistedCourses;
        break;
      default:
        courses = enrolledCourses;
    }

    // Apply search filter
    if (searchTerm) {
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      courses = courses.filter(course => course.category === filterBy);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        courses = courses.sort((a, b) => new Date(b.lastAccessed || b.enrolledAt) - new Date(a.lastAccessed || a.enrolledAt));
        break;
      case 'progress':
        courses = courses.sort((a, b) => (b.progress?.percentage || 0) - (a.progress?.percentage || 0));
        break;
      case 'title':
        courses = courses.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        courses = courses.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      default:
        break;
    }

    return courses;
  };

  const getContinueWatchingCourses = () => {
    return enrolledCourses
      .filter(course => course.progress?.percentage > 0 && course.progress?.percentage < 100)
      .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
      .slice(0, 4);
  };

  const getRecommendedCourses = () => {
    // Simple recommendation based on completed courses categories
    const completedCategories = completedCourses.map(course => course.category);
    return enrolledCourses
      .filter(course => 
        course.progress?.percentage === 0 && 
        completedCategories.includes(course.category)
      )
      .slice(0, 3);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getProgressColor = (percentage) => {
    if (percentage < 25) return 'bg-red-500';
    if (percentage < 50) return 'bg-yellow-500';
    if (percentage < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const tabs = [
    { id: 'learning', label: 'My Learning', count: enrolledCourses.filter(c => c.progress?.percentage < 100).length },
    { id: 'completed', label: 'Completed', count: completedCourses.length },
    { id: 'wishlist', label: 'Wishlist', count: wishlistedCourses.length }
  ];

  const categories = [...new Set([...enrolledCourses, ...completedCourses, ...wishlistedCourses].map(c => c.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
              <p className="text-gray-600 mt-1">Track your progress and continue your learning journey</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-white rounded-lg border p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Learning Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedCourses.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {enrolledCourses.filter(course => course.progress?.percentage < 100).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <BookmarkPlus className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Wishlist</p>
                  <p className="text-2xl font-bold text-gray-900">{wishlistedCourses.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Consistency Indicator */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">Data Consistency Check</h4>
              </div>
              <div className="mt-2 text-sm text-blue-800">
                <p>Enrolled courses shown: {enrolledCourses.length}</p>
                <p>Completed courses shown: {completedCourses.length}</p>
                <p>Wishlist items shown: {wishlistedCourses.length}</p>
                <p className="mt-2 text-xs text-blue-600">
                  If numbers don't match dashboard, orphaned progress records were cleaned up automatically.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Continue Watching Section */}
        {getContinueWatchingCourses().length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Continue Watching</h2>
              <Link to="/my-learning" className="text-purple-600 hover:text-purple-700 font-medium">
                View all
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getContinueWatchingCourses().map(course => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                  onClick={() => navigate(`/learn/${course.courseId || course._id}`)}
                >
                  <div className="relative">
                    <img
                      src={course.thumbnail?.url || '/api/placeholder/400/225'}
                      alt={course.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                    
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                      <div 
                        className={`h-full ${getProgressColor(course.progress?.percentage || 0)}`}
                        style={{ width: `${course.progress?.percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{course.instructor?.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-600 font-medium">
                        {Math.round(course.progress?.percentage || 0)}% complete
                      </span>
                      <span className="text-xs text-gray-500">
                        {course.progress?.currentLesson?.title || 'Start learning'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between p-6 pb-0">
              <nav className="flex space-x-8">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search your courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-80"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="recent">Recently Accessed</option>
                  <option value="progress">Progress</option>
                  <option value="title">Title A-Z</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Course List */}
          <div className="p-6">
            {getFilteredCourses().length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {activeTab === 'learning' && 'No courses in progress'}
                  {activeTab === 'completed' && 'No completed courses'}
                  {activeTab === 'wishlist' && 'Your wishlist is empty'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'learning' && 'Start learning by enrolling in a course'}
                  {activeTab === 'completed' && 'Complete a course to see it here'}
                  {activeTab === 'wishlist' && 'Add courses to your wishlist to save them for later'}
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {getFilteredCourses().map(course => (
                  <CourseCard
                    key={course.courseId}
                    course={course}
                    viewMode={viewMode}
                    activeTab={activeTab}
                    onContinue={() => navigate(`/learn/${course.courseId}`)}
                    onView={() => navigate(`/courses/${course.courseId}`)}
                    onRate={handleCourseRating}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setSelectedCourseForRating(null);
        }}
        onSubmit={handleRatingSubmit}
        courseName={selectedCourseForRating?.title || ''}
      />
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course, viewMode, activeTab, onContinue, onView, onRate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleDownloadCertificate = async () => {
    try {
      // For completed courses, generate/get certificate and redirect to viewer
      console.log('Generating certificate for course:', course.courseId || course._id);
      
      const response = await certificateAPI.generateCertificate(course.courseId || course._id);
      console.log('Certificate response:', response);
      
      // Handle both new certificate creation and existing certificate cases
      const certificate = response.certificate || response;
      
      if (certificate && (certificate.certificateId && certificate.verificationCode)) {
        toast.success('Certificate ready for viewing!');
        
        // Redirect to certificate viewer page
        const certificateId = certificate.certificateId;
        const verificationCode = certificate.verificationCode;
        
        // Open certificate in new tab
        window.open(`/certificate/${certificateId}/${verificationCode}`, '_blank');
      } else {
        console.error('Invalid certificate response:', response);
        toast.error('Failed to generate certificate - invalid response');
      }
    } catch (error) {
      console.error('Certificate generation error:', error);
      if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Course not completed or certificate requirements not met');
      } else {
        toast.error('Failed to generate certificate. Please try again.');
      }
    }
    setShowMenu(false);
  };

  const handleShareCourse = async (platform) => {
    try {
      // For completed courses, generate certificate and share the certificate link
      if (activeTab === 'completed') {
        const response = await certificateAPI.generateCertificate(course.courseId || course._id);
        
        // Handle both new certificate creation and existing certificate cases
        const certificate = response.certificate || response;
        
        if (certificate && certificate.certificateId && certificate.verificationCode) {
          const certificateId = certificate.certificateId;
          const verificationCode = certificate.verificationCode;
          const shareText = `I just completed "${course.title}" and earned my certificate! 🎉`;
          const shareUrl = `${window.location.origin}/certificate/${certificateId}/${verificationCode}`;
          
          switch (platform) {
            case 'twitter':
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
              break;
            case 'linkedin':
              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
              break;
            case 'facebook':
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
              break;
            case 'copy':
              navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
              toast.success('Certificate link copied to clipboard!');
              break;
          }
        } else {
          toast.error('Failed to generate certificate for sharing');
        }
      } else {
        // For other courses, share the course page
        const shareText = `Check out this course: "${course.title}"`;
        const shareUrl = `${window.location.origin}/courses/${course.courseId || course._id}`;
        
        switch (platform) {
          case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
            break;
          case 'linkedin':
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
            break;
          case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
            break;
          case 'copy':
            navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
            toast.success('Course link copied to clipboard!');
            break;
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share. Please try again.');
    }
    setShowMenu(false);
  };

  const handleRateCourse = () => {
    onRate(course);
    setShowMenu(false);
  };

  const handleViewCourse = () => {
    // For completed courses, go to learning page to review
    if (activeTab === 'completed') {
      navigate(`/learn/${course.courseId}`);
    } else {
      navigate(`/courses/${course.courseId}`);
    }
    setShowMenu(false);
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <img
          src={course.thumbnail?.url || '/api/placeholder/200/120'}
          alt={course.title}
          className="w-32 h-20 object-cover rounded-lg"
        />
        
        <div className="flex-1 ml-4">
          <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{course.instructor?.name}</p>
          
          {course.progress && (
            <div className="flex items-center space-x-4">
              <div className="flex-1 max-w-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className="text-xs text-gray-600">{Math.round(course.progress.percentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(course.progress.percentage)}`}
                    style={{ width: `${course.progress.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'learning' && (
            <button
              onClick={onContinue}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              Continue
            </button>
          )}
          
          {activeTab === 'completed' && (
            <>
              <button
                onClick={handleViewCourse}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>Review</span>
              </button>
              <button
                onClick={handleDownloadCertificate}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
              >
                <Award className="w-4 h-4" />
                <span>View Certificate</span>
              </button>
            </>
          )}
          
          {activeTab === 'wishlist' && (
            <button
              onClick={handleViewCourse}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              View Course
            </button>
          )}
          
          {activeTab === 'learning' && (
            <button
              onClick={handleViewCourse}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Details
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 group"
    >
      <div className="relative">
        <img
          src={course.thumbnail?.url || '/api/placeholder/400/225'}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        
        {course.progress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className={`h-full ${getProgressColor(course.progress.percentage)}`}
              style={{ width: `${course.progress.percentage}%` }}
            ></div>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                {activeTab === 'completed' && (
                  <>                <button 
                  onClick={handleDownloadCertificate}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Download className="w-4 h-4 mr-3" />
                  View Certificate
                </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <div className="px-4 py-1">
                      <span className="text-xs text-gray-500 font-medium">Share Achievement</span>
                    </div>
                    <button 
                      onClick={() => handleShareCourse('twitter')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Share2 className="w-4 h-4 mr-3" />
                      Share on Twitter
                    </button>
                    <button 
                      onClick={() => handleShareCourse('linkedin')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Share2 className="w-4 h-4 mr-3" />
                      Share on LinkedIn
                    </button>
                    <button 
                      onClick={() => handleShareCourse('copy')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Share2 className="w-4 h-4 mr-3" />
                      Copy Link
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button 
                      onClick={handleRateCourse}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Star className="w-4 h-4 mr-3" />
                      Rate & Review
                    </button>
                  </>
                )}
                {activeTab === 'learning' && (
                  <>
                    <button 
                      onClick={handleViewCourse}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-3" />
                      View Course Details
                    </button>
                  </>
                )}
                {activeTab === 'wishlist' && (
                  <>
                    <button 
                      onClick={handleViewCourse}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-3" />
                      View Course
                    </button>
                    <button 
                      onClick={() => {/* Implement remove from wishlist */}}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <X className="w-4 h-4 mr-3" />
                      Remove from Wishlist
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{course.instructor?.name}</p>
        
        {course.progress && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                {Math.round(course.progress.percentage)}% complete
              </span>
              <span className="text-sm text-gray-500">
                {course.progress.currentLesson?.title}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(course.progress.percentage)}`}
                style={{ width: `${course.progress.percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          {activeTab === 'learning' && (
            <button
              onClick={onContinue}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Continue</span>
            </button>
          )}
          
          {activeTab === 'completed' && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-green-600 mr-4">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <button
                onClick={handleViewCourse}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Review</span>
              </button>
              <button
                onClick={handleDownloadCertificate}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Award className="w-4 h-4" />
                <span>View Certificate</span>
              </button>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <button
              onClick={onView}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Course</span>
            </button>
          )}

          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(course.duration || 0)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const getProgressColor = (percentage) => {
  if (percentage < 25) return 'bg-red-500';
  if (percentage < 50) return 'bg-yellow-500';
  if (percentage < 75) return 'bg-blue-500';
  return 'bg-green-500';
};

const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export default MyLearningEnhanced;
