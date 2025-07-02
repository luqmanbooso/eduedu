import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Award, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Play, 
  CheckCircle,
  Star,
  Calendar,
  Search,
  Filter,
  Bell,
  Download,
  BarChart3,
  Target,
  Book,
  Video,
  PenTool,
  Brain,
  Trophy,
  Eye,
  ArrowRight,
  BookMarked,
  GraduationCap,
  ChevronRight,
  Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import NotificationCenter from '../components/NotificationCenter';
import { useStudentDashboard } from '../hooks/useStudentDashboard';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Use custom hook for dashboard data
  const {
    enrolledCourses,
    availableCourses,
    notifications,
    certificates,
    loading,
    error,
    enrollInCourse,
    continueLearning,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    downloadCertificate
  } = useStudentDashboard();

  // Enhanced course management functions
  const handleEnrollInCourse = async (courseId) => {
    const success = await enrollInCourse(courseId);
    if (success) {
      // Course will be automatically moved to enrolled courses by the hook
    }
  };

  const handleContinueLearning = async (courseId) => {
    const success = await continueLearning(courseId);
    if (success) {
      // Navigate to course learning page
      // This would typically use react-router navigation
    }
  };

  const tabContent = {
    overview: <OverviewTab 
      enrolledCourses={enrolledCourses} 
      notifications={notifications}
      certificates={certificates}
    />,
    courses: <MyCoursesTab 
      courses={enrolledCourses}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      onContinue={handleContinueLearning}
    />,
    browse: <BrowseCoursesTab 
      courses={availableCourses}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      filterLevel={filterLevel}
      setFilterLevel={setFilterLevel}
      filterCategory={filterCategory}
      setFilterCategory={setFilterCategory}
      onEnroll={handleEnrollInCourse}
    />,
    progress: <ProgressTab courses={enrolledCourses} />,
    certificates: <CertificatesTab 
      certificates={certificates} 
      onDownload={downloadCertificate}
    />,
    discussions: <DiscussionsTab />,
    notifications: <NotificationsTab 
      notifications={notifications}
      onMarkAsRead={markNotificationAsRead}
      onMarkAllAsRead={markAllNotificationsAsRead}
      onDelete={deleteNotification}
    />
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name || 'Student'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Continue your learning journey
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter notifications={notifications} />
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'S'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'courses', label: 'My Courses', icon: BookOpen },
              { id: 'browse', label: 'Browse Courses', icon: Search },
              { id: 'progress', label: 'Progress', icon: TrendingUp },
              { id: 'certificates', label: 'Certificates', icon: Award },
              { id: 'discussions', label: 'Discussions', icon: MessageSquare },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ enrolledCourses, notifications, certificates }) => {
  const totalProgress = enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length || 0;
  const completedCourses = enrolledCourses.filter(course => course.progress === 100).length;
  const upcomingDeadlines = enrolledCourses.flatMap(course => 
    course.upcomingDeadlines?.map(deadline => ({
      ...deadline,
      courseName: course.title
    })) || []
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Enrolled Courses"
          value={enrolledCourses.length}
          icon={BookOpen}
          color="blue"
          trend="+2 this month"
        />
        <StatCard
          title="Average Progress"
          value={`${Math.round(totalProgress)}%`}
          icon={TrendingUp}
          color="green"
          trend="Keep going!"
        />
        <StatCard
          title="Completed Courses"
          value={completedCourses}
          icon={CheckCircle}
          color="purple"
          trend="Great job!"
        />
        <StatCard
          title="Certificates Earned"
          value={certificates.length}
          icon={Award}
          color="yellow"
          trend="Well done!"
        />
      </div>

      {/* Current Courses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Continue Learning
          </h2>
          <Link 
            to="/courses"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrolledCourses.slice(0, 2).map((course) => (
            <CourseProgressCard key={course._id} course={course} />
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Upcoming Deadlines
          </h2>
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline, index) => (
              <DeadlineCard key={index} deadline={deadline} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {notifications.slice(0, 3).map((notification) => (
            <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className={`p-2 rounded-full ${
                notification.type === 'achievement' ? 'bg-green-100 text-green-600' :
                notification.type === 'deadline' ? 'bg-red-100 text-red-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {notification.type === 'achievement' ? <Trophy className="h-4 w-4" /> :
                 notification.type === 'deadline' ? <Calendar className="h-4 w-4" /> :
                 <Bell className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {notification.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {notification.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// My Courses Tab Component
const MyCoursesTab = ({ courses, searchTerm, setSearchTerm, onContinue }) => {
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search your courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <EnrolledCourseCard key={course._id} course={course} index={index} onContinue={onContinue} />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {searchTerm ? 'Try adjusting your search terms' : 'Start by enrolling in some courses'}
          </p>
        </div>
      )}
    </div>
  );
};

// Browse Courses Tab Component
const BrowseCoursesTab = ({ 
  courses, 
  searchTerm, 
  setSearchTerm, 
  filterLevel, 
  setFilterLevel,
  filterCategory,
  setFilterCategory,
  onEnroll
}) => {
  const categories = ['all', 'Programming', 'Design', 'Data Science', 'Business', 'Marketing'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {levels.map(level => (
                <option key={level} value={level}>
                  {level === 'all' ? 'All Levels' : level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <AvailableCourseCard key={course._id} course={course} index={index} onEnroll={onEnroll} />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
};

// Progress Tab Component
const ProgressTab = ({ courses }) => {
  const totalLessons = courses.reduce((acc, course) => acc + course.totalLessons, 0);
  const completedLessons = courses.reduce((acc, course) => acc + course.completedLessons, 0);
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Overall Learning Progress
        </h2>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Progress
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {completedLessons}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Lessons Completed
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {courses.filter(c => c.progress === 100).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Courses Completed
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round(courses.reduce((acc, course) => acc + (course.estimatedTimeLeft ? parseInt(course.estimatedTimeLeft) : 0), 0))}h
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Time Remaining
            </div>
          </div>
        </div>
      </div>

      {/* Individual Course Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Course Progress Details
        </h2>
        
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseProgressDetail key={course._id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Certificates Tab Component
const CertificatesTab = ({ certificates, onDownload }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Your Certificates
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {certificates.length} certificate(s) earned
          </div>
        </div>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <CertificateCard 
                key={certificate._id || certificate.id} 
                certificate={certificate} 
                onDownload={onDownload}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No certificates yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Complete courses to earn certificates
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Discussions Tab Component
const DiscussionsTab = () => {
  const [discussions, setDiscussions] = useState([
    {
      id: '1',
      title: 'Help with React Hooks',
      category: 'question',
      course: 'React Advanced Patterns',
      author: 'John Doe',
      replies: 5,
      lastActivity: '2 hours ago',
      isPinned: false
    },
    {
      id: '2',
      title: 'Course Materials Update',
      category: 'announcement',
      course: 'Machine Learning Fundamentals',
      author: 'Jane Smith',
      replies: 12,
      lastActivity: '1 day ago',
      isPinned: true
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Course Discussions
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Start Discussion
          </button>
        </div>

        <div className="space-y-4">
          {discussions.map((discussion) => (
            <div 
              key={discussion.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {discussion.isPinned && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Pinned
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      discussion.category === 'announcement' ? 'bg-blue-100 text-blue-800' :
                      discussion.category === 'question' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {discussion.category}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {discussion.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    in {discussion.course} • by {discussion.author}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {discussion.replies} replies
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
    </div>
  );
};

// Notifications Tab Component
const NotificationsTab = ({ notifications, onMarkAsRead, onMarkAllAsRead, onDelete }) => {
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }
  };

  const handleDeleteNotification = (notificationId, e) => {
    e.stopPropagation();
    onDelete(notificationId);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            All Notifications
          </h2>
          <button 
            onClick={onMarkAllAsRead}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Mark all as read
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                notification.isRead 
                  ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' 
                  : 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  notification.type === 'certificate_issued' ? 'bg-green-100 text-green-600' :
                  notification.type === 'course_completion' ? 'bg-purple-100 text-purple-600' :
                  notification.type === 'quiz_result' ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {notification.type === 'certificate_issued' ? <Trophy className="h-4 w-4" /> :
                   notification.type === 'course_completion' ? <CheckCircle className="h-4 w-4" /> :
                   notification.type === 'quiz_result' ? <Brain className="h-4 w-4" /> :
                   <Bell className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
                <button
                  onClick={(e) => handleDeleteNotification(notification._id, e)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              You're all caught up!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {trend}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};

const CourseProgressCard = ({ course }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {course.title}
        </h3>
        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          {course.progress}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-4">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${course.progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
        <span>{course.estimatedTimeLeft} left</span>
      </div>
      
      <div className="flex space-x-2">
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
          <Play className="h-4 w-4 mr-2" />
          Continue
        </button>
        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <Eye className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

const DeadlineCard = ({ deadline }) => {
  const isUrgent = new Date(deadline.dueDate) - new Date() < 3 * 24 * 60 * 60 * 1000; // 3 days

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg ${
      isUrgent ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-700'
    }`}>
      <div className={`p-2 rounded-full ${
        deadline.type === 'assignment' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
      }`}>
        {deadline.type === 'assignment' ? <FileText className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">
          {deadline.title}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {deadline.courseName} • Due {deadline.dueDate}
        </p>
      </div>
      {isUrgent && (
        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
          Urgent
        </span>
      )}
    </div>
  );
};

const EnrolledCourseCard = ({ course, index, onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
    >
      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
        <BookOpen className="h-12 w-12 text-white" />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
            course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {course.level}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full font-medium">
            {course.category}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {course.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-300">Progress</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {course.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center">
            <Book className="h-4 w-4 mr-1" />
            {course.completedLessons}/{course.totalLessons} lessons
          </span>
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {course.estimatedTimeLeft}
          </span>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {course.hasQuizzes && (
            <button 
              onClick={() => toast.success('Quiz section opened!')}
              className="flex flex-col items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Brain className="h-4 w-4 text-green-600 dark:text-green-400 mb-1" />
              <span className="text-xs text-green-600 dark:text-green-400">Quiz</span>
            </button>
          )}
          {course.hasAssignments && (
            <button 
              onClick={() => toast.success('Assignment section opened!')}
              className="flex flex-col items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mb-1" />
              <span className="text-xs text-blue-600 dark:text-blue-400">Tasks</span>
            </button>
          )}
          {course.hasDiscussions && (
            <button 
              onClick={() => toast.success('Discussion forum opened!')}
              className="flex flex-col items-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400 mb-1" />
              <span className="text-xs text-purple-600 dark:text-purple-400">Forum</span>
            </button>
          )}
          <button 
            onClick={() => toast.success('Course materials opened!')}
            className="flex flex-col items-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <Download className="h-4 w-4 text-orange-600 dark:text-orange-400 mb-1" />
            <span className="text-xs text-orange-600 dark:text-orange-400">Files</span>
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onContinue && onContinue(course._id)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center flex items-center justify-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Continue Learning
          </button>
          
          <Link
            to={`/courses/${course._id}`}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
        
        {course.upcomingDeadlines && course.upcomingDeadlines.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming: {course.upcomingDeadlines[0].title}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-300">
              Due {course.upcomingDeadlines[0].dueDate}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AvailableCourseCard = ({ course, index, onEnroll }) => {
  const handleEnroll = () => {
    onEnroll(course._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
    >
      <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center">
        <BookOpen className="h-12 w-12 text-white" />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
            course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {course.level}
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
            {course.difficulty}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-3 py-1 rounded-full font-medium">
            {course.category}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {course.title}
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
            {course.instructor?.name?.charAt(0) || 'A'}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            by {course.instructor?.name || 'Anonymous'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {course.enrolledStudents}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {course.duration}h
            </span>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
            <span className="font-medium">{course.rating?.average}</span>
            <span className="ml-1">({course.rating?.count})</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {course.discountPrice ? (
              <>
                <span className="text-lg font-bold text-green-600">
                  ${course.discountPrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${course.price}
                </span>
              </>
            ) : course.price === 0 ? (
              <span className="text-lg font-bold text-green-600">
                FREE
              </span>
            ) : (
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ${course.price}
              </span>
            )}
          </div>
          {course.discountPrice && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              Save ${course.price - course.discountPrice}
            </span>
          )}
        </div>
        
        {/* Course Features */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            <span>Lifetime Access</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            <span>Certificate of Completion</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            <span>Mobile & Desktop Access</span>
          </div>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <Link
            to={`/courses/${course._id}`}
            className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-center"
          >
            Preview Course
          </Link>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <Heart className="h-4 w-4" />
          </button>
        </div>
        
        <button
          onClick={handleEnroll}
          className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-300 ${
            course.price === 0 
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white'
          }`}
        >
          {course.price === 0 ? 'Enroll for Free' : `Enroll Now - $${course.discountPrice || course.price}`}
        </button>
      </div>
    </motion.div>
  );
};

const CourseProgressDetail = ({ course }) => {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {course.title}
        </h3>
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {course.progress}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
          style={{ width: `${course.progress}%` }}
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-300">Completed:</span>
          <div className="font-medium text-gray-900 dark:text-white">
            {course.completedLessons}/{course.totalLessons} lessons
          </div>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-300">Next:</span>
          <div className="font-medium text-gray-900 dark:text-white">
            {course.nextLesson}
          </div>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-300">Time Left:</span>
          <div className="font-medium text-gray-900 dark:text-white">
            {course.estimatedTimeLeft}
          </div>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-300">Last Access:</span>
          <div className="font-medium text-gray-900 dark:text-white">
            {course.lastAccessed}
          </div>
        </div>
      </div>
    </div>
  );
};

const CertificateCard = ({ certificate, onDownload }) => {
  const handleDownload = () => {
    onDownload(certificate._id || certificate.id);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-700"
    >
      <div className="flex items-center justify-between mb-4">
        <Award className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
          {certificate.grade || 'Completed'}
        </span>
      </div>
      
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
        {certificate.courseName || certificate.course?.title}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        Instructor: {certificate.instructor || certificate.course?.instructor?.name}
      </p>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Completed: {new Date(certificate.completedDate || certificate.issuedAt).toLocaleDateString()}
      </p>
      
      <button
        onClick={handleDownload}
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
      >
        <Download className="h-4 w-4 mr-2" />
        Download Certificate
      </button>
    </motion.div>
  );
};

export default StudentDashboard;
