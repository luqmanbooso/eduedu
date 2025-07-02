import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Users, 
  BookOpen, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Search,
  Filter,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Award,
  AlertTriangle,
  BarChart3,
  Calendar,
  GridIcon,
  File,
  PieChart,
  Layers,
  Shield,
  DollarSign,
  HelpCircle,
  MessageSquare,
  UserCheck,
  X,
  ArrowRight,
  Video
} from 'lucide-react';
import { adminAPI, courseAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingCourses, setPendingCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [stats, setStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [courseStatusFilter, setCourseStatusFilter] = useState('pending');

  // Sample admin user - replace with actual auth context
  const adminUser = {
    name: 'Admin User',
    email: 'admin@charityLMS.com',
    avatar: '/api/placeholder/40/40'
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, pendingData, coursesData] = await Promise.all([
        adminAPI.getDashboardStats().catch(err => ({ overview: {}, topCategories: [] })),
        adminAPI.getPendingCourses().catch(err => ({ courses: [], total: 0 })),
        adminAPI.getAllCourses().catch(err => ({ courses: [], total: 0 }))
      ]);
      
      setStats(statsData);
      setPendingCourses(pendingData.courses || []);
      setAllCourses(coursesData.courses || []);
      
      // Create notifications based on pending courses
      const pendingCount = pendingData.courses?.length || 0;
      setNotifications([
        ...(pendingCount > 0 ? [{
          id: 1, 
          message: `${pendingCount} course${pendingCount > 1 ? 's' : ''} pending review`, 
          time: 'Now', 
          unread: true,
          type: 'course_review'
        }] : []),
        { id: 2, message: 'System backup completed', time: '2 hours ago', unread: false },
        { id: 3, message: 'Monthly report generated', time: '1 day ago', unread: false }
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      // Set empty states on error
      setStats({ overview: {} });
      setPendingCourses([]);
      setAllCourses([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseStatusChange = async (courseId, status, rejectionReason = '') => {
    try {
      setActionLoading(true);
      await adminAPI.updateCourseStatus(courseId, status, rejectionReason);
      
      // Show success message
      alert(`Course ${status === 'published' ? 'approved' : status === 'draft' ? 'rejected' : 'updated'} successfully!`);
      
      // Close modal if open
      setShowCourseModal(false);
      setSelectedCourse(null);
      
      // Reload data to reflect changes
      await loadAdminData();
    } catch (error) {
      console.error('Error updating course status:', error);
      alert('Failed to update course status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const CourseModal = () => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    if (!selectedCourse) return null;

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 border border-purple-200">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Course Review</h2>
                <p className="text-sm text-gray-500">Evaluate and manage course publication</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowCourseModal(false);
                setSelectedCourse(null);
                setShowRejectForm(false);
                setRejectionReason('');
              }}
              className="p-2 hover:bg-gray-200 text-gray-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 py-3 border-b border-gray-200 bg-white">
            <div className="flex space-x-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'content', label: 'Course Content' },
                { id: 'instructor', label: 'Instructor' },
                { id: 'checklist', label: 'Review Checklist' }
              ].map(tab => (
                <button 
                  key={tab.id} 
                  className={`px-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-purple-600 text-purple-600' 
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Course Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Course Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
                      <img
                        src={selectedCourse.thumbnail?.url || '/api/placeholder/240/160'}
                        alt={selectedCourse.title}
                        className="w-full sm:w-60 h-40 object-cover border border-gray-200"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600">{selectedCourse.category}</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600">{selectedCourse.level}</span>
                          <span className={`px-2 py-1 text-white ${
                            selectedCourse.status === 'review' ? 'bg-yellow-500' :
                            selectedCourse.status === 'published' ? 'bg-green-500' :
                            selectedCourse.status === 'draft' ? 'bg-gray-500' : 'bg-red-500'
                          }`}>
                            {selectedCourse.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                          <img
                            src={selectedCourse.instructor?.profile?.avatar || '/api/placeholder/32/32'}
                            alt={selectedCourse.instructor?.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <p className="text-sm text-gray-600">by {selectedCourse.instructor?.name}</p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <BookOpen size={14} />
                            <span>{selectedCourse.modules?.length || 0} modules</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{selectedCourse.duration || 0}h duration</span>
                          </div>
                          {selectedCourse.price > 0 ? (
                            <div className="flex items-center space-x-1">
                              <DollarSign size={14} />
                              <span>${selectedCourse.price}</span>
                            </div>
                          ) : (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1">Free</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50 p-5 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Course Description</h4>
                      <p className="text-gray-700 whitespace-pre-line">{selectedCourse.description}</p>
                    </div>

                    {/* Learning Outcomes */}
                    {selectedCourse.learningOutcomes && selectedCourse.learningOutcomes.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Learning Outcomes</h4>
                        <ul className="bg-white border border-gray-200 p-5 space-y-2">
                          {selectedCourse.learningOutcomes.map((outcome, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="p-1 bg-green-100 rounded-full mt-0.5">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              </div>
                              <span className="text-gray-700">{outcome}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Previous Rejection */}
                    {selectedCourse.rejectionReason && (
                      <div className="p-5 bg-red-50 border-l-4 border-red-500">
                        <h4 className="font-semibold text-red-800 mb-2">Previous Rejection Reason</h4>
                        <p className="text-red-700">{selectedCourse.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Course Stats & Actions */}
                  <div className="space-y-6">
                    {/* Statistics */}
                    <div className="bg-white border border-gray-200 p-5">
                      <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Course Statistics</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Modules</span>
                          <span className="font-medium">{selectedCourse.modules?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lessons</span>
                          <span className="font-medium">{selectedCourse.totalLessons || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-medium">{selectedCourse.duration || 0}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price</span>
                          <span className="font-medium">${selectedCourse.price || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created</span>
                          <span className="font-medium">
                            {new Date(selectedCourse.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated</span>
                          <span className="font-medium">
                            {new Date(selectedCourse.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {selectedCourse.status === 'review' && (
                      <div className="space-y-3">
                        <button
                          onClick={() => handleCourseStatusChange(selectedCourse._id, 'published')}
                          disabled={actionLoading}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={18} />
                          <span>{actionLoading ? 'Processing...' : 'Approve Course'}</span>
                        </button>

                        {!showRejectForm ? (
                          <button
                            onClick={() => setShowRejectForm(true)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-red-500 text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <XCircle size={18} />
                            <span>Reject Course</span>
                          </button>
                        ) : (
                          <div className="space-y-3 bg-white border border-gray-200 p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Rejection Reason</h4>
                            <textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Please provide detailed feedback on why this course is being rejected..."
                              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                              rows="3"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleCourseStatusChange(selectedCourse._id, 'draft', rejectionReason)}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 text-sm"
                              >
                                {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                              </button>
                              <button
                                onClick={() => {
                                  setShowRejectForm(false);
                                  setRejectionReason('');
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'content' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Structure</h3>
                <div className="border border-gray-200">
                  {selectedCourse.modules?.length > 0 ? (
                    selectedCourse.modules.map((module, index) => (
                      <div key={index} className="border-b border-gray-200 last:border-b-0">
                        <div className="p-4 bg-gray-50 flex items-center justify-between">
                          <h4 className="font-medium">Module {index + 1}: {module.title}</h4>
                          <span className="text-sm text-gray-500">{module.lessons?.length || 0} lessons</span>
                        </div>
                        {module.lessons && module.lessons.length > 0 && (
                          <div className="px-4">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div key={lessonIndex} className="py-3 border-b border-gray-100 last:border-b-0 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {lesson.type === 'video' && <Video className="w-4 h-4 text-blue-500" />}
                                  {lesson.type === 'quiz' && <BookOpen className="w-4 h-4 text-purple-500" />}
                                  {lesson.type === 'assignment' && <File className="w-4 h-4 text-orange-500" />}
                                  {lesson.type === 'text' && <File className="w-4 h-4 text-green-500" />}
                                  <span className="text-sm">{lesson.title}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {lesson.type === 'video' && `${Math.floor((lesson.videoDuration || 0) / 60)} min`}
                                  {lesson.type === 'quiz' && `${lesson.quiz?.questions?.length || 0} questions`}
                                  {lesson.type === 'assignment' && 'Assignment'}
                                  {lesson.type === 'text' && 'Reading'}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">No course content available</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'instructor' && (
              <div className="p-6">
                <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 bg-white border border-gray-200 p-6">
                  <img
                    src={selectedCourse.instructor?.profile?.avatar || '/api/placeholder/128/128'}
                    alt={selectedCourse.instructor?.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedCourse.instructor?.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{selectedCourse.instructor?.email}</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800">
                        {selectedCourse.instructor?.createdCourses?.length || 0} courses
                      </span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800">
                        Joined {selectedCourse.instructor?.createdAt ? new Date(selectedCourse.instructor.createdAt).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                    <p className="text-gray-700">{selectedCourse.instructor?.profile?.bio || 'No instructor bio available.'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'checklist' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Review Checklist</h3>
                <div className="bg-white border border-gray-200 p-5 space-y-4">
                  {[
                    { id: 1, item: 'Course has appropriate title and description', defaultChecked: true },
                    { id: 2, item: 'Content is original and doesn\'t violate copyright', defaultChecked: true },
                    { id: 3, item: 'Course meets quality standards', defaultChecked: true },
                    { id: 4, item: 'Content is accurate and up-to-date', defaultChecked: true },
                    { id: 5, item: 'No harmful, illegal, or offensive content', defaultChecked: true },
                    { id: 6, item: 'Pricing is reasonable for the content offered', defaultChecked: true },
                    { id: 7, item: 'Course thumbnail is appropriate and professional', defaultChecked: true },
                    { id: 8, item: 'Course is properly categorized', defaultChecked: true },
                  ].map(item => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <input 
                        type="checkbox" 
                        id={`check-${item.id}`} 
                        defaultChecked={item.defaultChecked}
                        className="mt-1"
                      />
                      <label htmlFor={`check-${item.id}`} className="text-gray-700">{item.item}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const AdminNavigation = () => (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
        </div>

        {/* Admin Menu */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'courses', label: 'Course Approval', icon: BookOpen },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: PieChart },
            { id: 'categories', label: 'Categories', icon: Layers },
            { id: 'finances', label: 'Finances', icon: DollarSign },
            { id: 'support', label: 'Support', icon: HelpCircle },
            { id: 'messaging', label: 'Messages', icon: MessageSquare },
            { id: 'instructors', label: 'Instructors', icon: UserCheck },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm transition-colors ${
                  isActive 
                    ? 'bg-purple-700 text-white font-medium' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.id === 'courses' && pendingCourses.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-sm">
                    {pendingCourses.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="p-4 border-t border-gray-800">
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <img
              src={adminUser.avatar}
              alt={adminUser.name}
              className="w-10 h-10 rounded-full border-2 border-gray-700 group-hover:border-purple-500 transition-colors"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{adminUser.name}</p>
              <p className="text-xs text-gray-400 truncate">{adminUser.email}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400 group-hover:text-white transition-colors" />
          </div>
          
          <AnimatePresence>
            {showUserMenu && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 bg-gray-800 rounded border border-gray-700"
              >
                <button className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-left hover:bg-gray-700 text-gray-300">
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <button className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-left hover:bg-gray-700 text-red-400">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, Admin</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your platform effectively</p>
            </div>

            {/* Right side - Search and Notifications */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Bell size={20} />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded shadow-lg border border-gray-200 z-50"
                    >
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <button 
                          className="text-xs text-purple-600 hover:text-purple-800"
                          onClick={() => console.log('Mark all as read')}
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                                notification.unread ? 'bg-purple-50' : ''
                              }`}
                            >
                              <div className="flex items-start">
                                <div className={`p-2 rounded-md mr-3 ${
                                  notification.type === 'course_review' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                  {notification.type === 'course_review' ? <BookOpen size={16} /> : <Bell size={16} />}
                                </div>
                                <div>
                                  <p className="text-sm text-gray-900">{notification.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500">No notifications</div>
                        )}
                      </div>
                      <div className="p-2 border-t border-gray-200">
                        <button className="w-full text-xs text-center text-purple-600 hover:text-purple-800 py-1">
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 rounded">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Today</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded">
            Export Reports
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 border border-gray-200 hover:shadow transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.totalUsers || 0}</p>
                <span className="ml-2 text-xs font-medium text-green-600">+8.4%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">From last month</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-6 border border-gray-200 hover:shadow transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.totalCourses || 0}</p>
                <span className="ml-2 text-xs font-medium text-green-600">+12.1%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">From last month</p>
            </div>
            <div className="p-3 bg-green-50 border border-green-100">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white p-6 border border-gray-200 hover:shadow transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published Courses</p>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.publishedCourses || 0}</p>
                <span className="ml-2 text-xs font-medium text-green-600">+5.7%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">From last month</p>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-100">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white p-6 border border-gray-200 hover:shadow transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
              <div className="flex items-baseline mt-1">
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.totalEnrollments || 0}</p>
                <span className="ml-2 text-xs font-medium text-green-600">+22.3%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">From last month</p>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-100">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Analytics and Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        {/* Analytics Chart Placeholder */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Platform Analytics</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-200">Daily</button>
              <button className="px-3 py-1 text-xs bg-purple-600 text-white">Weekly</button>
              <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-200">Monthly</button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 bg-gray-50">
            <p className="text-gray-500">Analytics chart will be displayed here</p>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Actions</h3>
          <div className="space-y-4">
            <div 
              className="p-4 border-l-4 border-yellow-400 bg-yellow-50 flex items-center justify-between cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => setActiveTab('courses')}
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Course Reviews</p>
                  <p className="text-xs text-gray-500">Pending approval</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 text-xs font-medium">
                  {pendingCourses.length}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-2" />
              </div>
            </div>
            
            <div className="p-4 border-l-4 border-blue-400 bg-blue-50 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Support Tickets</p>
                  <p className="text-xs text-gray-500">Awaiting response</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-200 text-blue-800 px-2 py-1 text-xs font-medium">
                  4
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-2" />
              </div>
            </div>
            
            <div className="p-4 border-l-4 border-purple-400 bg-purple-50 flex items-center justify-between cursor-pointer hover:bg-purple-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">New Instructors</p>
                  <p className="text-xs text-gray-500">Awaiting verification</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="bg-purple-200 text-purple-800 px-2 py-1 text-xs font-medium">
                  7
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const CourseApprovalView = () => (
    <div className="space-y-6">
      {/* Page Header with Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses..."
              className="pl-10 pr-4 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 min-w-[200px] sm:min-w-[240px]"
            />
          </div>
          <div className="relative">
            <button className="flex items-center space-x-1 px-3 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm">
              <Filter size={14} />
              <span>Filter</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {[
            { id: 'pending', label: 'Pending Review', count: pendingCourses.length },
            { id: 'all', label: 'All Courses', count: allCourses.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCourseStatusFilter(tab.id)}
              className={`px-1 py-3 text-sm font-medium transition-all border-b-2 ${
                courseStatusFilter === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Course List with Animation */}
      <div className="space-y-4">
        {(courseStatusFilter === 'pending' ? pendingCourses : allCourses).map((course, index) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white border border-gray-200 p-5 hover:shadow transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              {/* Thumbnail */}
              <div className="md:w-48 flex-shrink-0">
                <div className="relative">
                  <img
                    src={course.thumbnail?.url || '/api/placeholder/240/160'}
                    alt={course.title}
                    className="w-full h-32 object-cover"
                  />
                  <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium text-white ${
                    course.status === 'review' ? 'bg-yellow-500' :
                    course.status === 'published' ? 'bg-green-500' :
                    course.status === 'draft' ? 'bg-gray-500' : 'bg-red-500'
                  }`}>
                    {course.status}
                  </span>
                </div>
              </div>
              
              {/* Course Information */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <div className="flex space-x-2 mt-2 md:mt-0">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1">{course.category}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1">{course.level}</span>
                    {course.createdAt && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  {/* Course Stats */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <BookOpen size={14} />
                      <span>{course.modules?.length || 0} modules</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{course.duration || 0}h duration</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>{course.enrolledStudents?.length || 0} students</span>
                    </div>
                    {course.price > 0 ? (
                      <div className="flex items-center space-x-1">
                        <DollarSign size={14} />
                        <span>${course.price}</span>
                      </div>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1">Free</span>
                    )}
                  </div>
                  
                  {/* Instructor Info */}
                  <div className="flex items-center space-x-2 mt-3 md:mt-0">
                    <img
                      src={course.instructor?.profile?.avatar || '/api/placeholder/32/32'}
                      alt={course.instructor?.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-600">by {course.instructor?.name || 'Unknown Instructor'}</span>
                  </div>
                </div>

                {/* Rejection Reason */}
                {course.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500">
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Rejection Reason:</span> {course.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 mt-4 md:mt-0">
                <button
                  onClick={() => handleViewCourse(course)}
                  className="flex items-center justify-center space-x-1 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm"
                >
                  <Eye size={16} />
                  <span>Review</span>
                </button>
                
                {course.status === 'review' && (
                  <>
                    <button
                      onClick={() => handleCourseStatusChange(course._id, 'published')}
                      disabled={actionLoading}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm disabled:opacity-50"
                    >
                      <CheckCircle size={16} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Rejection reason (optional):');
                        if (reason !== null) {
                          handleCourseStatusChange(course._id, 'draft', reason);
                        }
                      }}
                      disabled={actionLoading}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      <span>Reject</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Empty State */}
        {(courseStatusFilter === 'pending' ? pendingCourses : allCourses).length === 0 && (
          <div className="text-center py-20 bg-white border border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {courseStatusFilter === 'pending' ? 'No courses pending review' : 'No courses found'}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {courseStatusFilter === 'pending' 
                ? 'When instructors submit courses for review, they will appear here.'
                : 'Try adjusting your search or filter criteria to find courses.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const UsersView = () => (
    <div className="space-y-6">
      {/* Page Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 min-w-[200px] sm:min-w-[240px]"
            />
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors">
            Add User
          </button>
        </div>
      </div>
      
      {/* User Filters */}
      <div className="flex flex-wrap gap-2">
        <button className="px-3 py-1 text-sm bg-purple-600 text-white">
          All Users
        </button>
        <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors">
          Students
        </button>
        <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors">
          Instructors
        </button>
        <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors">
          Admins
        </button>
      </div>
      
      {/* Users Table */}
      <div className="bg-white border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-medium text-gray-700">All Users</h3>
        </div>
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 py-3 px-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-700">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Actions</div>
        </div>
        
        {/* Sample Table Data */}
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="grid grid-cols-12 gap-4 py-4 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm">
            <div className="col-span-1 text-gray-500">{index}</div>
            <div className="col-span-3 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                {String.fromCharCode(64 + index)}
              </div>
              <span className="font-medium">User {index}</span>
            </div>
            <div className="col-span-3 text-gray-600">user{index}@example.com</div>
            <div className="col-span-2">
              <span className={`px-2 py-1 text-xs ${
                index % 3 === 0 ? 'bg-blue-100 text-blue-800' : 
                index % 3 === 1 ? 'bg-purple-100 text-purple-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {index % 3 === 0 ? 'Student' : index % 3 === 1 ? 'Instructor' : 'Admin'}
              </span>
            </div>
            <div className="col-span-2">
              <span className={`px-2 py-1 text-xs ${
                index % 2 === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {index % 2 === 0 ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="col-span-1 flex items-center space-x-2">
              <button className="p-1 text-gray-500 hover:text-gray-700">
                <Eye size={16} />
              </button>
              <button className="p-1 text-gray-500 hover:text-gray-700">
                <Settings size={16} />
              </button>
            </div>
          </div>
        ))}
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">Showing 1 to 5 of 100 users</div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-300 text-sm text-gray-700 hover:bg-gray-100">
              Previous
            </button>
            <button className="px-3 py-1 bg-purple-600 text-white text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 text-sm text-gray-700 hover:bg-gray-100">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 text-sm text-gray-700 hover:bg-gray-100">
              3
            </button>
            <button className="px-3 py-1 border border-gray-300 text-sm text-gray-700 hover:bg-gray-100">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const AnalyticsView = () => (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Last 30 Days</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors text-sm">
            Download Report
          </button>
        </div>
      </div>
      
      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { 
            title: "Course Engagement", 
            value: "86%", 
            change: "+12%", 
            trend: "up",
            description: "Average completion rate"
          },
          { 
            title: "Revenue", 
            value: "$12,480", 
            change: "+8%", 
            trend: "up",
            description: "Total monthly revenue"
          },
          { 
            title: "New Enrollments", 
            value: "648", 
            change: "-3%", 
            trend: "down",
            description: "New students this month"
          }
        ].map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white border border-gray-200 p-6"
          >
            <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <span className={`ml-2 text-xs font-medium ${
                card.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.change}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{card.description}</p>
          </motion.div>
        ))}
      </div>
      
      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Enrollment Analytics</h3>
              <div className="flex space-x-2 text-xs">
                <button className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200">Daily</button>
                <button className="px-3 py-1 bg-purple-600 text-white">Weekly</button>
                <button className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200">Monthly</button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Chart placeholder */}
            <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 bg-gray-50">
              <p className="text-gray-500">Enrollment trends chart will be displayed here</p>
            </div>
          </div>
        </div>
        
        {/* Popular Categories */}
        <div className="bg-white border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Top Categories</h3>
          </div>
          <div className="p-6 space-y-4">
            {[
              { name: "Programming", value: 42, color: "bg-blue-600" },
              { name: "Data Science", value: 28, color: "bg-purple-600" },
              { name: "Design", value: 18, color: "bg-green-600" },
              { name: "Business", value: 12, color: "bg-yellow-600" }
            ].map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{category.name}</span>
                  <span className="font-medium text-gray-900">{category.value}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2">
                  <div 
                    className={`${category.color} h-2`}
                    style={{ width: `${category.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { 
              action: "New enrollment", 
              subject: "Introduction to Programming", 
              time: "5 minutes ago",
              icon: UserCheck,
              iconBg: "bg-green-100 text-green-600"
            },
            { 
              action: "Course approved", 
              subject: "Advanced Data Analysis", 
              time: "2 hours ago",
              icon: CheckCircle,
              iconBg: "bg-blue-100 text-blue-600"
            },
            { 
              action: "New user registered", 
              subject: "John Smith", 
              time: "4 hours ago",
              icon: User,
              iconBg: "bg-purple-100 text-purple-600"
            },
            { 
              action: "Payment received", 
              subject: "$129.99", 
              time: "Yesterday",
              icon: DollarSign,
              iconBg: "bg-yellow-100 text-yellow-600"
            }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-start space-x-4 p-4 hover:bg-gray-50">
                <div className={`p-2 rounded ${item.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">{item.action}</p>
                  <p className="text-sm text-gray-600">{item.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'courses':
        return <CourseApprovalView />;
      case 'users':
        return <UsersView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <DashboardView />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Click outside handlers */}
      {(showNotifications || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
      
      {/* Course Modal */}
      {showCourseModal && <CourseModal />}

      {/* Admin navigation with sidebar */}
      <AdminNavigation />
      
      {/* Main Content area */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto pb-12">
            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-30">
                <div className="bg-white p-6 rounded shadow-lg text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing...</p>
                </div>
              </div>
            )}
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
