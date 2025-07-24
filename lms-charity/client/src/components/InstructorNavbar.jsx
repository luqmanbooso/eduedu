import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  BookOpen, 
  BarChart3, 
  Bell,
  Sparkles,
  Home,
  Award,
  PlusCircle,
  ChevronDown,
  ArrowRight,
  Users,
  FileText,
  Upload,
  Calendar,
  MessageSquare,
  TrendingUp,
  GraduationCap,
  Edit
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import api from '../services/api';

function FloatingNotificationCenter() {
  return (
    <div style={{ position: 'fixed', top: 18, right: 160, zIndex: 1000 }}>
      <NotificationCenter />
    </div>
  );
}

const InstructorNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCoursesHovered, setIsCoursesHovered] = useState(false);
  const [instructorStats, setInstructorStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/profile/stats');
        setInstructorStats(res.data.instructor);
      } catch (e) {
        setInstructorStats(null);
      }
    };
    if (user?.role === 'instructor') fetchStats();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  // Instructor-specific navigation items
  const navItems = [
    // Removed 'Dashboard', 'My Courses', 'Students'
    // Add other items here if needed
  ];

  // Course management dropdown items
  const courseManagementItems = [
    {
      title: 'Course Management',
      items: [
        { name: 'All Courses', href: '/instructor/courses', icon: BookOpen, description: 'View and manage all your courses' },
        { name: 'Create Course', href: '/create-course', icon: PlusCircle, description: 'Build a new course from scratch' },
        { name: 'Draft Courses', href: '/instructor/drafts', icon: Edit, description: 'Work on unpublished courses' }
      ]
    },
    {
      title: 'Content & Management',
      items: [
        { name: 'Video Library', href: '/instructor/videos', icon: Upload, description: 'Manage your video content' },
        { name: 'Assignments', href: '/instructor/assignments', icon: FileText, description: 'Create and grade assignments' },

        { name: 'Course Materials', href: '/instructor/materials', icon: FileText, description: 'Course files and documents' }
      ]
    },
    {
      title: 'Communication',
      items: [
        { name: 'Messages', href: '/instructor/messages', icon: MessageSquare, description: 'Student communications' },
        { name: 'Announcements', href: '/instructor/announcements', icon: Bell, description: 'Course announcements' },
        { name: 'Q&A Forum', href: '/instructor/forum', icon: MessageSquare, description: 'Course discussion forum' },
        { name: 'Live Sessions', href: '/instructor/live', icon: Calendar, description: 'Schedule live classes' }
      ]
    }
  ];

  const userNavItems = [
    // Removed 'Analytics', 'Earnings', 'Messages'
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-white border-b border-gray-200"
      >
        <div className="flex justify-between items-center h-16 px-4">
          {/* Logo with Instructor Badge */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="flex items-center space-x-3"
          >
            <Link to="/instructor/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">EduCharity</h1>
                <p className="text-xs text-purple-600 font-medium">Instructor</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 ml-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                              (item.href === '/instructor/courses' && location.pathname.startsWith('/instructor/courses'));
              
              if (item.hasDropdown && item.name === 'My Courses') {
                return (
                  <div 
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setIsCoursesHovered(true)}
                    onMouseLeave={() => setIsCoursesHovered(false)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        to={item.href}
                        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                        <ChevronDown className="w-3 h-3 ml-1 transition-transform duration-200" />
                      </Link>
                    </motion.div>

                    {/* Course Management Dropdown */}
                    <AnimatePresence>
                      {isCoursesHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="fixed top-16 left-0 right-0 w-full bg-white shadow-2xl border-t border-gray-200 z-50"
                        >
                          <div className="max-w-7xl mx-auto px-4 py-12">
                            {/* Header */}
                            <div className="text-center mb-12">
                              <h3 className="text-3xl font-bold text-black mb-4 font-serif">Instructor Tools & Resources</h3>
                              <p className="text-lg text-gray-600 max-w-3xl mx-auto">Everything you need to create, manage, and grow your courses</p>
                            </div>
                            
                            {/* Course Management Sections */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
                              {courseManagementItems.map((section, sectionIndex) => (
                                <div key={section.title}>
                                  <h4 className="text-xl font-bold text-black mb-6">{section.title}</h4>
                                  <div className="space-y-4">
                                    {section.items.map((item, index) => {
                                      const ItemIcon = item.icon;
                                      return (
                                        <motion.div
                                          key={item.name}
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.3, delay: (sectionIndex * 4 + index) * 0.05 }}
                                          whileHover={{ x: 4 }}
                                        >
                                          <Link
                                            to={item.href}
                                            className="flex items-start space-x-4 p-4 bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 hover:border-purple-200"
                                          >
                                            <div className="w-10 h-10 bg-purple-600 flex items-center justify-center text-white">
                                              <ItemIcon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                              <h5 className="font-semibold text-black group-hover:text-purple-600 transition-colors">
                                                {item.name}
                                              </h5>
                                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                          </Link>
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Quick Stats */}
                            <div className="bg-purple-50 border border-purple-200 p-8 mb-12">
                              <div className="text-center mb-6">
                                <h4 className="text-xl font-bold text-black mb-2">Your Teaching Impact</h4>
                                <p className="text-gray-600">See how you're making a difference</p>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-purple-600">12</div>
                                  <div className="text-sm text-gray-600">Active Courses</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-black">1,247</div>
                                  <div className="text-sm text-gray-600">Total Students</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-purple-600">4.8⭐</div>
                                  <div className="text-sm text-gray-600">Avg. Rating</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-black">89%</div>
                                  <div className="text-sm text-gray-600">Completion Rate</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Footer CTA */}
                            <div className="text-center pt-8 border-t border-gray-200">
                              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link 
                                  to="/create-course"
                                  className="inline-flex items-center px-8 py-3 text-white bg-purple-600 hover:bg-purple-700 font-medium transition-colors"
                                >
                                  <PlusCircle className="mr-2 w-4 h-4" />
                                  Create New Course
                                </Link>
                                <Link 
                                  to="/instructor/analytics"
                                  className="inline-flex items-center px-8 py-3 text-black bg-gray-100 hover:bg-gray-200 font-medium transition-colors"
                                >
                                  <BarChart3 className="mr-2 w-4 h-4" />
                                  View Analytics
                                </Link>
                              </div>
                              <div className="mt-4 text-sm text-gray-500">
                                Empower learners worldwide with your expertise
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-3 ml-auto">
            {/* Quick Action: Create Course */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:block"
            >
              <Link
                to="/create-course"
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Course</span>
              </Link>
            </motion.div>

            {/* Notifications */}
            <div 
              className="relative"
              onMouseEnter={() => setShowNotifications(true)}
              onMouseLeave={() => setShowNotifications(false)}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative p-4 hover:bg-gray-100 transition-colors"
              >
              </motion.button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 bg-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'I'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-black">{user?.name || 'Instructor'}</p>
                  <p className="text-xs text-purple-600">Instructor</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-64 bg-white shadow-xl border border-gray-200 py-2 z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-black">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs">
                          Instructor
                        </span>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs">
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <div className="text-lg font-bold text-purple-600">{user?.createdCourses?.length || 0}</div>
                          <div className="text-xs text-gray-500">Courses</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-black">{instructorStats?.totalStudentsTaught ?? 0}</div>
                          <div className="text-xs text-gray-500">Students</div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="py-1">
                      {userNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>

                    {/* Settings & Logout */}
                    <div className="border-t border-gray-100 pt-1">
                      <Link
                        to="/instructor/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Account Settings</span>
                      </Link>
                      <Link
                        to="/instructor/help"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Help & Support</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-gray-200 py-4"
            >
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 text-base font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {/* Mobile Quick Actions */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <Link
                    to="/create-course"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-base font-medium bg-purple-600 text-white"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Create Course</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Notification Center */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 right-4 z-50"
            onMouseEnter={() => setShowNotifications(true)}
            onMouseLeave={() => setShowNotifications(false)}
          >
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function InstructorNavbarWithFloating() {
  return (
    <>
      <InstructorNavbar />
      <FloatingNotificationCenter />
    </>
  );
}
