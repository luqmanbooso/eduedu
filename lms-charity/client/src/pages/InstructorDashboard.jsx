import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Award,
  Clock,
  TrendingUp,
  Target,
  Calendar,
  Play,
  CheckCircle,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  Settings,
  FileText,
  GraduationCap,
  Star,
  DollarSign,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  X,
  Layers,
  Video,
  HelpCircle,
  User
} from 'lucide-react';
import { courseAPI, instructorAPI } from '../services/api';
import CourseContentManager from '../components/CourseContentManager';
import DiscussionForum from '../components/DiscussionForum';
import GradingCenter from '../components/GradingCenter';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api'; // Make sure this import is present for direct API calls
import { toast } from 'react-toastify'; // Add this import at the top if using react-toastify
import axios from 'axios'; // Add this import for fetching student details

const InstructorDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showContentManager, setShowContentManager] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/courses')) {
      setActiveTab('courses');
    } else if (path.includes('/students')) {
      setActiveTab('students');
    } else if (path.includes('/discussions')) {
      setActiveTab('discussions');
    } else if (path.includes('/grading')) {
      setActiveTab('grading');
    } else if (path.includes('/certificates')) {
      setActiveTab('certificates');
    } else if (path.includes('/analytics')) {
      setActiveTab('analytics');
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchInstructorData();
    fetchInstructorCourses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (activeTab === 'courses') {
      fetchInstructorCourses();
    }
  }, [activeTab]);

  const fetchInstructorData = async () => {
    try {
      const data = await instructorAPI.getStats();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching instructor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorCourses = async () => {
    try {
      const data = await instructorAPI.getMyCourses();
      setInstructorCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await instructorAPI.getStudents();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]); // Ensure it's always an array
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare },
    { id: 'grading', label: 'Grading', icon: GraduationCap }
  ];

  const handleManageContent = (courseId) => {
    setSelectedCourseId(courseId);
    setShowContentManager(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-black mb-2 font-serif">
              Instructor Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back, {user.name}! Inspire minds and shape the future through teaching.
            </p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        {dashboardData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <StatCard
              title="Total Courses"
              value={dashboardData.totalCourses || instructorCourses.length}
              icon={<BookOpen className="h-6 w-6" />}
              color="bg-purple-600"
              change={12}
            />
            <StatCard
              title="Total Students"
              value={dashboardData.totalStudents || (students ? students.length : 0)}
              icon={<Users className="h-6 w-6" />}
              color="bg-black"
              change={8}
            />
            <StatCard
              title="Course Rating"
              value={`${dashboardData.averageRating || '4.8'}⭐`}
              icon={<Star className="h-6 w-6" />}
              color="bg-purple-500"
              change={5}
            />
            <StatCard
              title="Certificates Issued"
              value={dashboardData.certificatesIssued || 0}
              icon={<Award className="h-6 w-6" />}
              color="bg-gray-800"
              change={15}
            />
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <OverviewTab instructorCourses={instructorCourses} students={students} dashboardData={dashboardData} />
            </motion.div>
          )}

          {activeTab === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CoursesTab 
                courses={instructorCourses} 
                onManageContent={handleManageContent}
                onRefresh={fetchInstructorCourses}
              />
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StudentsTab students={students} courses={instructorCourses} onRefresh={fetchStudents} activeStudents={dashboardData?.activeStudents || 0} completedStudents={dashboardData?.completedStudents || 0} />
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
              <DiscussionsTab instructorId={user._id} courses={instructorCourses} />
            </motion.div>
          )}

          {activeTab === 'grading' && (
            <motion.div
              key="grading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GradingTab instructorId={user._id} courses={instructorCourses} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Certificate Creation Modal */}
        <CertificateCreationModal 
          isOpen={showCertificateModal} 
          onClose={() => setShowCertificateModal(false)} 
        />

        {/* Course Content Manager */}
        <CourseContentManager
          courseId={selectedCourseId}
          isOpen={showContentManager}
          onClose={() => setShowContentManager(false)}
        />
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, change }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
    className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
  >
    <div className="flex items-center">
      <div className={`${color} text-white p-3`}>
        {icon}
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-black">{value}</p>
      </div>
      {change && (
        <div className="text-right">
          <span className="text-xs text-green-600 font-medium">+{change}%</span>
          <p className="text-xs text-gray-500">this month</p>
        </div>
      )}
    </div>
  </motion.div>
);

// Overview Tab Component
const OverviewTab = ({ instructorCourses, students, dashboardData }) => {
  const [analyticsView, setAnalyticsView] = useState('overview');

  const totalRevenue = dashboardData?.totalRevenue || 0;
  const avgCompletion = dashboardData?.averageCompletion || 85;
  const totalHours = dashboardData?.totalHours || 120;

  return (
    <div className="space-y-8">
      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Course Activity */}
        <div className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-black">Recent Course Activity</h3>
            <Link to="/instructor/courses" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {instructorCourses.slice(0, 3).map((course, index) => (
              <motion.div
                key={course._id}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-4 p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-black">{course.title}</h4>
                  <p className="text-sm text-gray-600">
                    {course.enrolledStudents?.length || 0} students enrolled
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Students */}
        <div className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-black">Recent Students</h3>
            <Link to="/instructor/students" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {(students && Array.isArray(students) ? students : []).slice(0, 4).map((student, index) => (
              <motion.div
                key={student._id}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-4 p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-600 flex items-center justify-center text-white font-medium">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-black">{student.name}</h4>
                  <p className="text-sm text-gray-600">{student.progress}% complete</p>
                </div>
                <div className="w-16 bg-gray-200 h-2">
                  <div
                    className="bg-purple-600 h-2 transition-all duration-500"
                    style={{ width: `${student.progress}%` }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-black">Analytics & Insights</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setAnalyticsView('overview')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                analyticsView === 'overview' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setAnalyticsView('revenue')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                analyticsView === 'revenue' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setAnalyticsView('engagement')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                analyticsView === 'engagement' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Engagement
            </button>
          </div>
        </div>

        {analyticsView === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-purple-50 border border-purple-200">
              <div className="w-12 h-12 bg-purple-600 text-white mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-bold text-black">${totalRevenue.toLocaleString()}</h4>
              <p className="text-gray-600">Total Revenue</p>
              <p className="text-sm text-green-600 mt-1">+12% this month</p>
            </div>
            <div className="text-center p-6 bg-gray-50 border border-gray-200">
              <div className="w-12 h-12 bg-black text-white mx-auto mb-4 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-bold text-black">{avgCompletion}%</h4>
              <p className="text-gray-600">Avg. Completion</p>
              <p className="text-sm text-green-600 mt-1">+5% this month</p>
            </div>
            <div className="text-center p-6 bg-purple-50 border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 text-white mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-bold text-black">{totalHours}h</h4>
              <p className="text-gray-600">Content Hours</p>
              <p className="text-sm text-blue-600 mt-1">+8h this month</p>
            </div>
          </div>
        )}

        {analyticsView === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 bg-gray-50">
                <h5 className="font-semibold text-black mb-2">Monthly Revenue</h5>
                <p className="text-2xl font-bold text-black">${(totalRevenue * 0.3).toFixed(0)}</p>
                <p className="text-sm text-gray-600">This month</p>
              </div>
              <div className="p-4 border border-gray-200 bg-gray-50">
                <h5 className="font-semibold text-black mb-2">Course Sales</h5>
                <p className="text-2xl font-bold text-black">{instructorCourses.length * 23}</p>
                <p className="text-sm text-gray-600">Total sales</p>
              </div>
            </div>
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Detailed revenue charts would be displayed here</p>
            </div>
          </div>
        )}

        {analyticsView === 'engagement' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 bg-gray-50">
                <h5 className="font-semibold text-black mb-2">Active Students</h5>
                <p className="text-xl font-bold text-black">{(students?.length || 0)}</p>
              </div>
              <div className="p-4 border border-gray-200 bg-gray-50">
                <h5 className="font-semibold text-black mb-2">Course Rating</h5>
                <p className="text-xl font-bold text-black">4.8⭐</p>
              </div>
              <div className="p-4 border border-gray-200 bg-gray-50">
                <h5 className="font-semibold text-black mb-2">Discussion Posts</h5>
                <p className="text-xl font-bold text-black">127</p>
              </div>
            </div>
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p>Engagement metrics and charts would be displayed here</p>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Analytics Report
          </button>
        </div>
      </div>
    </div>
  );
};

// Courses Tab Component
const CoursesTab = ({ courses, onManageContent, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false); // New state for loading
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate(); // Add this if not present

  // Wrap onRefresh to manage loading state
  const handleRefreshCourses = async () => {
    setLoadingCourses(true);
    await onRefresh();
    setLoadingCourses(false);
  };

  useEffect(() => {
    // Initial fetch when component mounts
    handleRefreshCourses();
  }, []); // Empty dependency array means this runs once on mount

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && course.isPublished) ||
                         (filterStatus === 'draft' && !course.isPublished);
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'students':
        return (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const handleSelectCourse = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map(course => course._id));
    }
  };

  const handleBulkPublish = async () => {
    try {
      await instructorAPI.bulkPublishCourses(selectedCourses);
      handleRefreshCourses(); // Use the wrapped refresh function
      setSelectedCourses([]);
    } catch (error) {
      console.error('Error publishing courses:', error);
    }
  };

  const handleBulkUnpublish = async () => {
    try {
      await instructorAPI.bulkUnpublishCourses(selectedCourses);
      handleRefreshCourses(); // Use the wrapped refresh function
      setSelectedCourses([]);
    } catch (error) {
      console.error('Error unpublishing courses:', error);
    }
  };

  const generateReport = async () => {
    try {
      const data = await instructorAPI.generateReport('courses', {
        courseIds: selectedCourses.length > 0 ? selectedCourses : courses.map(c => c._id)
      });
      
      // Create and download the report
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `course-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  // New: Delete course logic
  const handleDeleteCourse = async (courseId) => {
    console.log('Delete course', courseId);
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success('Course deleted!');
      await handleRefreshCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course.');
    }
  };

  // New: Simple analytics
  const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0);
  const avgRating = courses.length ? (
    courses.reduce((sum, c) => sum + (parseFloat(c.rating?.average) || 0), 0) / courses.length
  ).toFixed(2) : 'N/A';

  // New: Stubs for additional actions
  const handlePreviewCourse = (courseId) => {
    console.log('Preview course', courseId);
    navigate(`/courses/preview/${courseId}`);
  };
  const handleEditCourse = (courseId) => {
    onManageContent(courseId);
  };
  const handleRequestPublication = async (courseId) => {
    try {
      const res = await api.patch(`/courses/${courseId}/submit-review`);
      alert(res.data?.message || 'Course submitted for admin review!');
      await handleRefreshCourses();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to request publication.');
    }
  };
  const handleWithdrawSubmission = async (courseId) => {
    // TODO: Call backend to withdraw submission
    alert('Withdraw submission - TODO');
  };
  const handleShowAnalytics = (courseId) => {
    // TODO: Show analytics modal or section
    alert('Show analytics - TODO');
  };
  const handleManageStudents = (courseId) => {
    // TODO: Show manage students modal or section
    alert('Manage students - TODO');
  };
  const handleShowAnnouncements = (courseId) => {
    console.log('Show announcements', courseId);
    alert('Announcements - TODO');
  };
  const handleShowReviews = (courseId) => {
    // TODO: Show reviews modal or section
    alert('Reviews - TODO');
  };
  const handleInviteCoInstructor = (courseId) => {
    // TODO: Show invite co-instructor modal
    alert('Invite co-instructor - TODO');
  };
  const handleUnpublish = async (courseId) => {
    try {
      const res = await api.put(`/courses/${courseId}/publish`, { isPublished: false });
      alert(res.data?.message || 'Course unpublished!');
      await handleRefreshCourses();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to unpublish course.');
    }
  };

  // Image fallback logic: use local asset if available
  const getImageSrc = (thumbnail) => {
    if (!thumbnail || typeof thumbnail !== 'string' || thumbnail.trim() === '') {
      return '/educharity-logo.svg'; // fallback to local logo in public/
    }
    return thumbnail;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-black font-serif">My Courses</h3>
          <p className="text-gray-600 mt-1">Manage and track your course portfolio</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Removed Generate Report button */}
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg text-center">
          <div className="text-sm text-purple-600">Total Enrollments</div>
          <div className="text-2xl font-bold text-purple-700">{totalEnrollments}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
          <div className="text-sm text-yellow-600">Average Rating</div>
          <div className="text-2xl font-bold text-yellow-700">{avgRating}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-center">
          <div className="text-sm text-gray-600">Total Courses</div>
          <div className="text-2xl font-bold text-gray-700">{courses.length}</div>
        </div>
      </div>
      {/* Error message for delete */}
      {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-black">{courses.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-black">
                {courses.filter(c => c.isPublished).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-black" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-purple-600">
                {courses.filter(c => !c.isPublished).length}
              </p>
            </div>
            <Edit className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-purple-600">
                {courses.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-4">
            {selectedCourses.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{selectedCourses.length} selected</span>
                <button
                  onClick={handleBulkPublish}
                  className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Publish
                </button>
                <button
                  onClick={handleBulkUnpublish}
                  className="text-sm px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Unpublish
                </button>
              </div>
            )}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="students">Most Students</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-black mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No courses found' : 'No courses yet'}
          </h4>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first course to get started'}
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <Link
              to="/courses/create"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors rounded-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Course
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course, index) => {
            // Use .url if thumbnail is an object, else use string, else fallback
            const imageSrc = (course.thumbnail && typeof course.thumbnail === 'object' ? course.thumbnail.url : course.thumbnail) || '/educharity-logo.svg';
            const completions = course.completions || Math.floor((course.enrolledStudents?.length || 0) * 0.7);
            const reviews = course.reviewsCount || Math.floor(Math.random() * 10);
            const isPublished = course.isPublished || course.status === 'Published';
            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 group flex flex-col"
              >
                {/* Image with hover overlay for actions */}
                <div className="relative">
                  <img
                    src={imageSrc}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                    onError={e => { e.target.onerror = null; e.target.src = '/educharity-logo.svg'; }}
                  />
                  {/* Overlay actions on hover (desktop), always show on mobile */}
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-white/80 rounded-full p-1 shadow-md md:flex-row flex-col md:space-x-2 md:space-y-0 space-y-2 md:space-y-0">
                    <button title="Edit" onClick={() => handleEditCourse(course._id)} className="p-2 rounded-full hover:bg-purple-100 text-purple-700" aria-label="Edit">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button title="Preview" onClick={() => handlePreviewCourse(course._id)} className="p-2 rounded-full hover:bg-purple-100 text-purple-700" aria-label="Preview">
                      <Eye className="w-5 h-5" />
                    </button>
                    {!isPublished && (
                      <button title="Request Publication" onClick={() => handleRequestPublication(course._id)} className="p-2 rounded-full hover:bg-purple-100 text-purple-700" aria-label="Request Publication">
                        <Upload className="w-5 h-5" />
                      </button>
                    )}
                    <button title="Delete" onClick={() => handleDeleteCourse(course._id)} disabled={deletingCourseId === course._id} className="p-2 rounded-full hover:bg-red-100 text-red-600" aria-label="Delete">
                      <X className="w-5 h-5" />
                    </button>
                    {isPublished && (
                      <button title="Unpublish" onClick={() => handleUnpublish(course._id)} className="p-2 rounded-full hover:bg-yellow-100 text-yellow-700" aria-label="Unpublish">
                        <Eye className="w-5 h-5" style={{ transform: 'scaleX(-1)' }} />
                      </button>
                    )}
                    {isPublished && (
                      <button title="Announcements" onClick={() => handleShowAnnouncements(course._id)} className="p-2 rounded-full hover:bg-blue-100 text-blue-700" aria-label="Announcements">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {/* Status badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-800 shadow">
                      {course.status || (isPublished ? 'Published' : 'Draft')}
                    </span>
                  </div>
                </div>
                {/* Card body */}
                <div className="flex-1 flex flex-col p-4">
                  <h4 className="text-base font-semibold text-black mb-1 line-clamp-1">{course.title}</h4>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
                    <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                      <span>{course.enrolledStudents?.length || 0}</span>
                      </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>{completions}</span>
                      </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                      <span>{course.rating?.average || '4.8'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{reviews}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Students Tab Component
const StudentsTab = ({ students, courses, onRefresh, activeStudents, completedStudents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showBulkEnrollModal, setShowBulkEnrollModal] = useState(false);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = (students && Array.isArray(students) ? students : [])
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return (b.totalProgress || 0) - (a.totalProgress || 0);
        case 'courses':
          return (b.coursesCount || 0) - (a.coursesCount || 0);
        case 'recent':
          return new Date(b.joinedAt) - new Date(a.joinedAt);
        default:
          return 0;
      }
    });

  const handleExportData = () => {
    // Export student data to CSV with real fields
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Courses Enrolled,Average Progress,Completed Courses,Certificates,Join Date\n"
      + filteredStudents.map(student => 
          `${student.name},${student.email},${student.courses.length},${student.averageProgress || 0}%,${student.completedCourses || 0},${student.totalCertificates || 0},${student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : 'N/A'}`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowStudentDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-black font-serif">Student Management</h3>
          <p className="text-gray-600 mt-1">Track and manage your students' progress</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Removed duplicate student count */}
        </div>
      </div>

      {/* Student Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-black">{students?.length || 0}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-green-600">{activeStudents || 0}</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Students</p>
              <p className="text-2xl font-bold text-purple-600">{completedStudents || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certificates Earned</p>
              <p className="text-2xl font-bold text-black">{students?.reduce((sum, s) => sum + (s.totalCertificates || 0), 0)}</p>
            </div>
            <Award className="w-8 h-8 text-black" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="name">Sort by Name</option>
              <option value="progress">Sort by Progress</option>
              <option value="courses">Sort by Courses</option>
              <option value="recent">Recently Joined</option>
            </select>
            
            <button 
              onClick={handleExportData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-black mb-2">
            {searchTerm ? 'No students found' : 'No students yet'}
          </h4>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Students will appear here once they enroll in your courses'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowBulkEnrollModal(true)}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
              Add Students
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrolled Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student, index) => (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleStudentClick(student)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-semibold">
                          {student.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-black">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{student.coursesCount || 0}</span> courses
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.enrolledCourses?.slice(0, 2).map(course => course.title).join(', ') || 'No courses'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2" style={{ width: '60px' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${student.totalProgress || 0}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-0">
                          {student.totalProgress || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.joinedAt ? new Date(student.joinedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStudentClick(student);
                          }}
                          className="text-purple-600 hover:text-purple-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 transition-colors">
                          <Award className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Enrollment Modal */}
      <BulkEnrollmentModal 
        isOpen={showBulkEnrollModal}
        onClose={() => setShowBulkEnrollModal(false)}
        courses={courses}
        onEnrollmentComplete={onRefresh}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={showStudentDetailModal}
        onClose={() => setShowStudentDetailModal(false)}
        student={selectedStudent}
        courses={courses}
      />
    </div>
  );
};

// Discussions Tab Component
const DiscussionsTab = ({ instructorId, courses = [] }) => {
  const [discussions, setDiscussions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const data = await instructorAPI.getDiscussions();
      setDiscussions(data.discussions || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    setShowDiscussionModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-black font-serif">Discussion Management</h3>
          <p className="text-gray-600 mt-1">Moderate and engage with course discussions</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            {discussions.length} Active Discussions
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Discussions</p>
              <p className="text-2xl font-bold text-black">{discussions.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unresolved</p>
              <p className="text-2xl font-bold text-orange-600">
                {discussions.filter(d => !d.resolved).length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.floor(discussions.length * 0.3)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Response Time</p>
              <p className="text-2xl font-bold text-purple-600">2.4h</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Course Selection for Discussion Management */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-black mb-4">Select Course to Manage Discussions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <motion.div
              key={course._id}
              whileHover={{ y: -2 }}
              onClick={() => handleCourseSelect(course._id)}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={course.thumbnail || 'https://via.placeholder.com/48/f3f4f6/6b7280?text=Course'}
                  alt={course.title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <h5 className="font-medium text-black">{course.title}</h5>
                  <p className="text-sm text-gray-500">
                    {course.discussionCount || 0} discussions
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Discussion Forum Modal */}
      <AnimatePresence>
        {showDiscussionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-black">Course Discussions</h3>
                <button
                  onClick={() => setShowDiscussionModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                <DiscussionForum 
                  courseId={selectedCourse} 
                  isOpen={true} 
                  onClose={() => setShowDiscussionModal(false)} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Grading Tab Component  
const GradingTab = ({ instructorId, courses = [] }) => {
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await instructorAPI.getAssignments();
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Compute assignmentsCount for each course
  const assignmentsByCourse = {};
  assignments.forEach(a => {
    assignmentsByCourse[a.course] = (assignmentsByCourse[a.course] || 0) + 1;
  });
  const coursesWithAssignments = courses.map(course => ({
    ...course,
    assignmentsCount: assignmentsByCourse[course._id] || 0
  }));

  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    setShowGradingModal(true);
  };

  const pendingGrades = assignments.filter(a => a.submissionsCount > a.gradedCount);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-black font-serif">Grading Center</h3>
          <p className="text-gray-600 mt-1">Review and grade student submissions</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            <FileText className="w-4 h-4 inline mr-1" />
            {pendingGrades.length} Pending Grades
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-black">{assignments.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Grades</p>
              <p className="text-2xl font-bold text-orange-600">{pendingGrades.length}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Grade</p>
              <p className="text-2xl font-bold text-green-600">87%</p>
            </div>
            <Star className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Graded This Week</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.floor(assignments.length * 0.4)}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Course Selection for Grading */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-black mb-4">Select Course to Grade Assignments</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coursesWithAssignments.map((course) => (
            <motion.div
              key={course._id}
              whileHover={{ y: -2 }}
              onClick={() => handleCourseSelect(course._id)}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <h5 className="font-medium text-black">{course.title}</h5>
                  <p className="text-sm text-gray-500">
                    {course.assignmentsCount} assignments
                  </p>
                  {course.pendingGrades > 0 && (
                    <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                      {course.pendingGrades} pending
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Grading Modal */}
      <AnimatePresence>
        {showGradingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-black">Assignment Grading</h3>
                <button
                  onClick={() => setShowGradingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                <GradingCenter 
                  courseId={selectedCourse} 
                  isOpen={true} 
                  onClose={() => setShowGradingModal(false)} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Certificates Tab Component
const CertificatesTab = ({ onCreateCertificate, courses }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await instructorAPI.getCertificates();
      setCertificates(data.certificates || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (studentId, courseId) => {
    try {
      await instructorAPI.issueCertificate(studentId, courseId);
      // Refresh certificates or show success message
      fetchCertificates();
    } catch (error) {
      console.error('Error issuing certificate:', error);
    }
  };

  const handleBulkIssueCertificates = async (courseId) => {
    try {
      await instructorAPI.bulkIssueCertificates([courseId], courseId);
      fetchCertificates();
    } catch (error) {
      console.error('Error bulk issuing certificates:', error);
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.courseName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !selectedCourse || cert.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-black font-serif">Certificate Management</h3>
          <p className="text-gray-600 mt-1">Issue and manage course completion certificates</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onCreateCertificate}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </button>
        </div>
      </div>

      {/* Certificate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Certificates</p>
              <p className="text-2xl font-bold text-purple-600">{certificates.length}</p>
            </div>
            <Award className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Issued This Month</p>
              <p className="text-2xl font-bold text-black">
                {certificates.filter(cert => {
                  const certDate = new Date(cert.createdAt);
                  const now = new Date();
                  return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-black" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">73%</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Issuance</p>
              <p className="text-2xl font-bold text-orange-600">12</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Course-based Certificate Issuance */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-black mb-4">Issue Certificates by Course</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <motion.div
              key={course._id}
              whileHover={{ y: -2 }}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={course.thumbnail || 'https://via.placeholder.com/48/f3f4f6/6b7280?text=Course'}
                  alt={course.title}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <h5 className="font-medium text-black">{course.title}</h5>
                  <p className="text-sm text-gray-500 mb-3">
                    {course.enrolledStudents?.length || 0} enrolled • {course.completedStudents || 0} completed
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBulkIssueCertificates(course._id)}
                      className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Bulk Issue
                    </button>
                    <button className="text-xs px-3 py-1 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors">
                      View Students
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
            
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Certificates List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-black">Issued Certificates</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-black mb-2">
                {searchTerm || selectedCourse ? 'No certificates found' : 'No certificates issued yet'}
              </h4>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCourse 
                  ? 'Try adjusting your search or filters'
                  : 'Certificates will appear here once students complete courses'}
              </p>
              {!searchTerm && !selectedCourse && (
                <button
                  onClick={onCreateCertificate}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Certificate Template
                </button>
              )}
            </div>
          ) : (
            filteredCertificates.map((certificate, index) => (
              <motion.div
                key={certificate._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded border flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h5 className="text-lg font-medium text-black">{certificate.studentName}</h5>
                      <p className="text-sm text-gray-600">{certificate.courseName}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Issued: {new Date(certificate.issuedAt).toLocaleDateString()}</span>
                        <span>Certificate ID: {certificate.certificateId}</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Certificate Creation Modal Component
const CertificateCreationModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'auto',
    template: 'modern',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    logoUrl: '',
    signatureUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Implement certificate creation API call
      // const data = await instructorAPI.createCertificateTemplate(formData);
      console.log('Certificate template created:', formData);
      onClose();
      setFormData({
        name: '',
        description: '',
        type: 'auto',
        template: 'modern',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        logoUrl: '',
        signatureUrl: ''
      });
    } catch (error) {
      console.error('Error creating certificate:', error);
      setError(error.response?.data?.message || 'Failed to create certificate template');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Create Certificate Template</h3>
                  <p className="text-gray-600 text-sm">Design a custom certificate for your courses</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Error creating certificate</h4>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Course Completion Certificate"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Describe when this certificate should be issued"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="auto">Auto-generated</option>
                    <option value="custom">Custom Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Style
                  </label>
                  <select
                    value={formData.template}
                    onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="elegant">Elegant</option>
                    <option value="minimalist">Minimalist</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                <div 
                  className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                  style={{ backgroundColor: formData.backgroundColor, color: formData.textColor }}
                >
                  <div className="text-center">
                    <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Certificate Preview</p>
                    <p className="text-xs opacity-75">{formData.name || 'Certificate Name'}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Template'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ dashboardData, courses, students }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Mock data for Course Enrollments Over Time
  const enrollmentData = [
    { name: 'Jan', enrollments: 4000 },
    { name: 'Feb', enrollments: 3000 },
    { name: 'Mar', enrollments: 2000 },
    { name: 'Apr', enrollments: 2780 },
    { name: 'May', enrollments: 1890 },
    { name: 'Jun', enrollments: 2390 },
    { name: 'Jul', enrollments: 3490 },
  ];

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const metrics = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'students', name: 'Student Performance', icon: Users },
    { id: 'revenue', name: 'Revenue', icon: DollarSign },
    { id: 'engagement', name: 'Engagement', icon: TrendingUp }
  ];

  // Calculate analytics data
  const totalStudents = students?.length || 0;
  const totalCourses = courses?.length || 0;
  const avgProgress = students?.length ? 
    Math.round(students.reduce((sum, s) => sum + (s.totalProgress || 0), 0) / students.length) : 0;
  const completionRate = Math.floor(avgProgress * 0.8); // Simulated completion rate

  const generateFullReport = async () => {
    try {
      const data = await instructorAPI.exportAnalytics('pdf', {
        timeRange,
        includeStudents: true,
        includeCourses: true,
        includeRevenue: true
      });
      
      // Create and download the report
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `instructor-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating analytics report:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-black font-serif">Analytics Dashboard</h3>
          <p className="text-gray-600 mt-1">Track your teaching performance and student engagement</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          <button
            onClick={generateFullReport}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-black">$12,450</p>
              <p className="text-xs text-green-600 mt-1">+15% from last month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Course Completion</p>
              <p className="text-2xl font-bold text-black">{completionRate}%</p>
              <p className="text-xs text-purple-600 mt-1">+8% from last month</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <p className="text-2xl font-bold text-black">4.8</p>
              <p className="text-xs text-yellow-600 mt-1">+0.2 from last month</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold text-black">78%</p>
              <p className="text-xs text-blue-600 mt-1">+12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Metric Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    selectedMetric === metric.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-black'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{metric.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {selectedMetric === 'overview' && (
            <div className="space-y-6">
              {/* Course Performance Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-black mb-4">Course Performance</h4>
                  <div className="space-y-3">
                    {courses.slice(0, 5).map((course, index) => (
                      <div key={course._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={course.thumbnail || 'https://via.placeholder.com/40/f3f4f6/6b7280?text=Course'}
                            alt={course.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-black text-sm">{course.title}</p>
                            <p className="text-xs text-gray-500">{course.enrolledStudents?.length || 0} students</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm text-black">{85 + index * 2}%</p>
                          <p className="text-xs text-gray-500">completion</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-black mb-4">Course Enrollments Over Time</h4>
                  <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={enrollmentData}
                        margin={{
                          top: 5, right: 30, left: 20, bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="enrollments" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Top Performing Students */}
              <div>
                <h4 className="text-lg font-semibold text-black mb-4">Top Performing Students</h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-600">
                    <div>Student</div>
                    <div>Courses Completed</div>
                    <div>Average Score</div>
                    <div>Certificates Earned</div>
                  </div>
                  {students.slice(0, 5).map((student, index) => (
                    <div key={student._id} className="grid grid-cols-4 gap-4 p-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {student.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <span className="text-sm font-medium text-black">{student.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">{Math.floor(Math.random() * 5) + 1}</div>
                      <div className="text-sm text-gray-600">{85 + Math.floor(Math.random() * 15)}%</div>
                      <div className="text-sm text-gray-600">{Math.floor(Math.random() * 3) + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedMetric === 'students' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Active Students</p>
                      <p className="text-2xl font-bold text-purple-700">{Math.floor(totalStudents * 0.8)}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Completed Courses</p>
                      <p className="text-2xl font-bold text-green-700">{Math.floor(totalStudents * 0.3)}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600">In Progress</p>
                      <p className="text-2xl font-bold text-yellow-700">{Math.floor(totalStudents * 0.5)}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-black mb-4">Student Performance Distribution</h4>
                <p className="text-gray-600">Detailed student analytics will be implemented with backend integration</p>
              </div>
            </div>
          )}

          {selectedMetric === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Total Earnings</p>
                      <p className="text-2xl font-bold text-green-700">$12,450</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">This Month</p>
                      <p className="text-2xl font-bold text-blue-700">$2,340</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Avg per Course</p>
                      <p className="text-2xl font-bold text-purple-700">$89</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-black mb-4">Revenue Breakdown</h4>
                <p className="text-gray-600">Revenue analytics will be implemented with payment system integration</p>
              </div>
            </div>
          )}

          {selectedMetric === 'engagement' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Discussion Posts</p>
                      <p className="text-2xl font-bold text-blue-700">156</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Video Watch Time</p>
                      <p className="text-2xl font-bold text-purple-700">1,240h</p>
                    </div>
                    <Play className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Assignment Submissions</p>
                      <p className="text-2xl font-bold text-green-700">89</p>
                    </div>
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-black mb-4">Engagement Trends</h4>
                <p className="text-gray-600">Engagement analytics will be implemented with detailed tracking</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Bulk Enrollment Modal Component
const BulkEnrollmentModal = ({ isOpen, onClose, courses, onEnrollmentComplete }) => {
  const [enrollmentMethod, setEnrollmentMethod] = useState('email');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [emailList, setEmailList] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let enrollmentData = {};

      if (enrollmentMethod === 'email') {
        const emails = emailList.split(',').map(email => email.trim()).filter(email => email);
        enrollmentData = {
          method: 'email',
          emails,
          courseId: selectedCourse
        };
      } else if (enrollmentMethod === 'csv' && csvFile) {
        const formData = new FormData();
        formData.append('file', csvFile);
        formData.append('courseId', selectedCourse);
        enrollmentData = formData;
      }

      await axios.post('/api/instructor/bulk-enrollment', enrollmentData, {
        headers: enrollmentMethod === 'csv' ? { 'Content-Type': 'multipart/form-data' } : {}
      });

      setSuccess('Students enrolled successfully!');
      onEnrollmentComplete();
      setTimeout(() => {
        onClose();
        setSuccess('');
        setEmailList('');
        setCsvFile(null);
        setSelectedCourse('');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to enroll students');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-black">Bulk Student Enrollment</h3>
            <p className="text-gray-600 text-sm">Enroll multiple students at once</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course *
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Choose a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Enrollment Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                enrollmentMethod === 'email' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  value="email"
                  checked={enrollmentMethod === 'email'}
                  onChange={(e) => setEnrollmentMethod(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Email List</div>
                  <div className="text-sm text-gray-600">Enter email addresses manually</div>
                </div>
              </label>

              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                enrollmentMethod === 'csv' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
              }`}>
                <input
                  type="radio"
                  value="csv"
                  checked={enrollmentMethod === 'csv'}
                  onChange={(e) => setEnrollmentMethod(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">CSV Upload</div>
                  <div className="text-sm text-gray-600">Upload a CSV file with student data</div>
                </div>
              </label>
            </div>
          </div>

          {enrollmentMethod === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Addresses *
              </label>
              <textarea
                value={emailList}
                onChange={(e) => setEmailList(e.target.value)}
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter email addresses separated by commas or new lines&#10;Example:&#10;student1@example.com, student2@example.com&#10;student3@example.com"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter email addresses separated by commas or new lines
              </p>
            </div>
          )}

          {enrollmentMethod === 'csv' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-300 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="hidden"
                  id="csv-upload"
                  required
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {csvFile ? csvFile.name : 'Click to upload CSV file'}
                  </p>
                </label>
              </div>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 font-medium mb-1">CSV Format:</p>
                <p className="text-xs text-gray-500">
                  Columns: Name, Email, (optional: Phone, Organization)
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedCourse}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Enrolling...' : 'Enroll Students'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Student Detail Modal Component
const StudentDetailModal = ({ isOpen, onClose, student, courses }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentDetails();
    }
    // eslint-disable-next-line
  }, [isOpen, student]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      // Fetch public profile (basic info, createdCourses, etc.)
      const profileRes = await axios.get(`/profile/public/${student._id}`);
      setStudentDetails({
        profile: profileRes.data,
      });
    } catch (error) {
      setStudentDetails(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !student) return null;

  if (loading || !studentDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex items-center justify-center"
          style={{ minHeight: 300 }}
        >
          <div className="flex flex-col items-center justify-center w-full h-full py-12">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading student details...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const { profile } = studentDetails;

  // Only show overview, courses, progress tabs
  const tabs = ['overview', 'courses', 'progress'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-semibold">
              {profile.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-black">{profile.name}</h3>
              <p className="text-gray-600">{profile.email || student.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Courses Enrolled</p>
                      <p className="text-2xl font-bold text-purple-700">{profile.createdCourses?.length || 0}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600">Joined</p>
                      <p className="text-2xl font-bold text-yellow-700">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <User className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <h4 className="font-semibold text-black mb-3">Student Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 text-black">{profile.email || student.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Joined:</span>
                    <span className="ml-2 text-black">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-black">Enrolled Courses</h4>
              <p className="text-gray-600">Course details will be available in a future update.</p>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-black">Learning Progress</h4>
              <div className="bg-white border border-gray-200 p-4 rounded-lg">
                <h5 className="font-medium text-black mb-3">Recent Activity</h5>
                <p className="text-gray-600">Recent activity tracking will be implemented with backend integration.</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => setShowMessageModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Send Message
          </button>
        </div>

        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg">
              <h4 className="text-lg font-semibold mb-4">Send Message to {profile.name}</h4>
              <textarea
                rows={5}
                className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                placeholder="Type your message here..."
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  // TODO: Implement send message logic
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InstructorDashboard;
