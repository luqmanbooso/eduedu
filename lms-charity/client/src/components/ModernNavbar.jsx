import React, { useState } from 'react';
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
  Search,
  Sparkles,
  Home,
  Award,
  PlusCircle,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCoursesHovered, setIsCoursesHovered] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen, hasDropdown: true },
    { name: 'About', href: '/about', icon: Sparkles },
    { name: 'Contact', href: '/contact', icon: User },
  ];

  const courseCategories = [
    { 
      name: 'Data Science', 
      description: 'Analytics, Machine Learning & AI',
      courses: ['Python for Data Science', 'Machine Learning Basics', 'Data Visualization']
    },
    { 
      name: 'Software Engineering', 
      description: 'Web & Mobile Development',
      courses: ['Full Stack Development', 'React.js Mastery', 'Node.js Backend']
    },
    { 
      name: 'IoT & Hardware', 
      description: 'Internet of Things & Electronics',
      courses: ['Arduino Programming', 'Raspberry Pi Projects', 'Smart Home Systems']
    },
    { 
      name: 'Digital Marketing', 
      description: 'SEO, Social Media & Analytics',
      courses: ['SEO Fundamentals', 'Social Media Strategy', 'Google Analytics']
    },
    { 
      name: 'Design', 
      description: 'UI/UX & Graphic Design',
      courses: ['UI/UX Design', 'Adobe Creative Suite', 'Figma Mastery']
    },
    { 
      name: 'Business', 
      description: 'Entrepreneurship & Management',
      courses: ['Startup Fundamentals', 'Project Management', 'Financial Planning']
    }
  ];

  const userNavItems = user ? [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'My Courses', href: '/my-courses', icon: BookOpen },
    { name: 'Certificates', href: '/certificates', icon: Award },
    ...(user.role === 'instructor' || user.role === 'admin' 
      ? [{ name: 'Create Course', href: '/create-course', icon: PlusCircle }] 
      : []),
    ...(user.role === 'admin' 
      ? [{ name: 'Admin Panel', href: '/admin', icon: Settings }] 
      : []),
  ] : [];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/80"
    >
      <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3"
          >
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EduCharity</h1>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              if (item.hasDropdown && item.name === 'Courses') {
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
                    >
                      <Link
                        to={item.href}
                        className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                        <ChevronDown className="w-3 h-3 ml-1 transition-transform duration-200" />
                      </Link>
                    </motion.div>

                    {/* Courses Dropdown */}
                    <AnimatePresence>
                      {isCoursesHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="fixed top-16 left-0 right-0 w-full bg-white shadow-2xl border-t border-gray-200 z-50"
                        >
                          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            {/* Header */}
                            <div className="text-center mb-12">
                              <h3 className="text-3xl font-bold text-gray-900 mb-4">Explore Our Course Categories</h3>
                              <p className="text-lg text-gray-600 max-w-3xl mx-auto">Choose from thousands of expertly designed courses across multiple disciplines to accelerate your career</p>
                            </div>
                            
                            {/* Course Categories Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
                              {courseCategories.map((category, index) => (
                                <motion.div
                                  key={category.name}
                                  initial={{ opacity: 0, y: 30 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="group text-center p-6 bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-indigo-200"
                                >
                                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                                    {category.name}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                                  <div className="text-xs text-indigo-600 font-medium">
                                    {category.courses.length} courses available
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                            
                            {/* Featured Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                              {/* Popular Courses */}
                              <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-6">Most Popular This Week</h4>
                                <div className="space-y-4">
                                  <div className="flex items-center space-x-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                      JS
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-semibold text-gray-900">Complete JavaScript Course</div>
                                      <div className="text-sm text-gray-600">Build real projects • 15.2k students</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-green-600">Free</div>
                                      <div className="text-xs text-gray-500">4.8 ⭐</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                      PY
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-semibold text-gray-900">Python for Data Science</div>
                                      <div className="text-sm text-gray-600">From basics to advanced • 12.8k students</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-green-600">Free</div>
                                      <div className="text-xs text-gray-500">4.9 ⭐</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                      UX
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-semibold text-gray-900">UI/UX Design Masterclass</div>
                                      <div className="text-sm text-gray-600">Design thinking + tools • 9.4k students</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-green-600">Free</div>
                                      <div className="text-xs text-gray-500">4.7 ⭐</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Learning Paths */}
                              <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-6">Recommended Learning Paths</h4>
                                <div className="space-y-4">
                                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                                    <div className="font-semibold text-gray-900 mb-2">🚀 Full Stack Developer</div>
                                    <div className="text-sm text-gray-600 mb-3">HTML, CSS, JavaScript, React, Node.js, MongoDB</div>
                                    <div className="flex items-center justify-between">
                                      <div className="text-xs text-indigo-600">6 courses • 120 hours</div>
                                      <div className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1">Beginner friendly</div>
                                    </div>
                                  </div>
                                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
                                    <div className="font-semibold text-gray-900 mb-2">📊 Data Scientist</div>
                                    <div className="text-sm text-gray-600 mb-3">Python, Statistics, Machine Learning, Data Viz</div>
                                    <div className="flex items-center justify-between">
                                      <div className="text-xs text-green-600">8 courses • 150 hours</div>
                                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1">High demand</div>
                                    </div>
                                  </div>
                                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                                    <div className="font-semibold text-gray-900 mb-2">🎨 Digital Marketer</div>
                                    <div className="text-sm text-gray-600 mb-3">SEO, Social Media, Analytics, Content Strategy</div>
                                    <div className="flex items-center justify-between">
                                      <div className="text-xs text-purple-600">5 courses • 80 hours</div>
                                      <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1">Creative</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Footer CTA */}
                            <div className="text-center pt-8 border-t border-gray-200">
                              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link 
                                  to="/courses"
                                  className="inline-flex items-center px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 font-medium transition-colors"
                                >
                                  Browse All Courses
                                  <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                                <Link 
                                  to="/learning-paths"
                                  className="inline-flex items-center px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium transition-colors"
                                >
                                  View Learning Paths
                                </Link>
                              </div>
                              <div className="mt-4 text-sm text-gray-500">
                                Join 50,000+ learners who are advancing their careers with our courses
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
                >
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Search Bar - Simplified */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
              />
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {/* Notifications */}
                <div 
                  className="relative"
                  onMouseEnter={() => setShowNotifications(true)}
                  onMouseLeave={() => setShowNotifications(false)}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </motion.button>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </motion.button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
                      >
                        {/* User Info */}
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md capitalize">
                            {user.role}
                          </span>
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
                                className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Get Started
                  </Link>
                </motion.div>
              </div>
            )}

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
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {user && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    {userNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
    </motion.nav>
  );
};

export default Navbar;
