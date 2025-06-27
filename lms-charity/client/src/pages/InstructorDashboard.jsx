import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
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
  X
} from 'lucide-react';
import axios from 'axios';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState(null);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/courses')) {
      setActiveTab('courses');
    } else if (path.includes('/students')) {
      setActiveTab('students');
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

  const fetchInstructorData = async () => {
    try {
      const response = await axios.get('/instructor/stats');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching instructor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorCourses = async () => {
    try {
      const response = await axios.get('/courses/instructor/my-courses');
      setInstructorCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/instructor/students');
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]); // Ensure it's always an array
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const quickActions = [
    {
      title: 'Create New Course',
      description: 'Build and publish a new course',
      icon: Plus,
      action: () => setShowCourseModal(true),
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700'
    },
    {
      title: 'Manage Courses',
      description: 'Edit existing course content',
      icon: Edit,
      action: () => setActiveTab('courses'),
      color: 'bg-black',
      hoverColor: 'hover:bg-gray-800'
    },
    {
      title: 'Student Progress',
      description: 'View student performance',
      icon: Users,
      action: () => setActiveTab('students'),
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      title: 'Generate Reports',
      description: 'Download course analytics',
      icon: FileText,
      action: () => generateReport(),
      color: 'bg-gray-800',
      hoverColor: 'hover:bg-gray-900'
    }
  ];

  const generateReport = () => {
    // Report generation logic
    console.log('Generating report...');
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-black mb-2 font-serif">
                Instructor Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Welcome back, {user.name}! Inspire minds and shape the future through teaching.
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:block"
            >
              <button
                onClick={() => setShowCourseModal(true)}
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Course
              </button>
            </motion.div>
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

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-black mb-6 font-serif">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={action.action}
                className={`${action.color} ${action.hoverColor} text-white p-6 cursor-pointer transition-colors duration-200`}
              >
                <action.icon className="w-8 h-8 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

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
              <OverviewTab instructorCourses={instructorCourses} students={students} />
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
              <CoursesTab courses={instructorCourses} onCreateCourse={() => setShowCourseModal(true)} />
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
              <StudentsTab students={students} />
            </motion.div>
          )}

          {activeTab === 'certificates' && (
            <motion.div
              key="certificates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CertificatesTab onCreateCertificate={() => setShowCertificateModal(true)} />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyticsTab dashboardData={dashboardData} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Course Creation Modal */}
        <CourseCreationModal 
          isOpen={showCourseModal} 
          onClose={() => setShowCourseModal(false)} 
          onCourseCreated={fetchInstructorCourses}
        />

        {/* Certificate Creation Modal */}
        <CertificateCreationModal 
          isOpen={showCertificateModal} 
          onClose={() => setShowCertificateModal(false)} 
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
const OverviewTab = ({ instructorCourses, students }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Recent Course Activity */}
    <div className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-black">Recent Course Activity</h3>
        <Link to="/courses" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
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
            <img
              src={course.thumbnail || '/api/placeholder/48/48'}
              alt={course.title}
              className="w-12 h-12 object-cover"
            />
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
        <Link to="/students" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
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
);

// Courses Tab Component
const CoursesTab = ({ courses, onCreateCourse }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-black font-serif">My Courses</h3>
          <p className="text-gray-600 mt-1">Manage and track your course portfolio</p>
        </div>
        <motion.button
          onClick={onCreateCourse}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Course
        </motion.button>
      </div>

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
              <p className="text-2xl font-bold text-green-600">
                {courses.filter(c => c.isPublished).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-yellow-600">
                {courses.filter(c => !c.isPublished).length}
              </p>
            </div>
            <Edit className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-600">
                {courses.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <button
              onClick={onCreateCourse}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Course
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 rounded-lg"
            >
              <div className="relative">
                <img
                  src={course.thumbnail || 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=Course+Image'}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    course.isPublished 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 text-xs font-medium bg-black bg-opacity-70 text-white rounded-full">
                    {course.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h4 className="text-lg font-semibold text-black mb-2 line-clamp-1">{course.title}</h4>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{course.enrolledStudents?.length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration || 0}h</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                    <span className="text-sm font-medium">{course.rating || '4.8'}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium rounded-lg flex items-center justify-center">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button className="flex-1 text-center px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm font-medium rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors text-sm rounded-lg">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// Students Tab Component
const StudentsTab = ({ students }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-black font-serif">Student Management</h3>
          <p className="text-gray-600 mt-1">Track and manage your students' progress</p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {filteredStudents.length} Students
          </span>
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
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Progress</p>
              <p className="text-2xl font-bold text-green-600">
                {students?.length ? Math.round(students.reduce((sum, s) => sum + (s.totalProgress || 0), 0) / students.length) : 0}%
              </p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active This Week</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.floor((students?.length || 0) * 0.8)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certificates Earned</p>
              <p className="text-2xl font-bold text-yellow-600">
                {Math.floor((students?.length || 0) * 0.3)}
              </p>
            </div>
            <Award className="w-8 h-8 text-yellow-600" />
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
            
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
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
          <p className="text-gray-600">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Students will appear here once they enroll in your courses'}
          </p>
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
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
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
                        <button className="text-purple-600 hover:text-purple-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 transition-colors">
                          <Download className="w-4 h-4" />
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
    </div>
  );
};

// Certificates Tab Component
const CertificatesTab = ({ onCreateCertificate }) => {
  const [certificates] = useState([
    {
      id: 1,
      name: 'Course Completion Certificate',
      type: 'auto',
      coursesUsed: 12,
      issued: 247,
      lastUsed: '2024-06-20',
      status: 'active'
    },
    {
      id: 2,
      name: 'Python Mastery Certificate',
      type: 'custom',
      coursesUsed: 3,
      issued: 89,
      lastUsed: '2024-06-18',
      status: 'active'
    },
    {
      id: 3,
      name: 'Advanced Programming Certificate',
      type: 'custom',
      coursesUsed: 1,
      issued: 34,
      lastUsed: '2024-06-15',
      status: 'draft'
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-black font-serif">Certificate Management</h3>
          <p className="text-gray-600 mt-1">Create and manage certificate templates for your courses</p>
        </div>
        <motion.button
          onClick={onCreateCertificate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Template
        </motion.button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Issued</p>
              <p className="text-2xl font-bold text-black">370</p>
            </div>
            <Award className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-green-600">23</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Templates</p>
              <p className="text-2xl font-bold text-blue-600">{certificates.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Downloads</p>
              <p className="text-2xl font-bold text-yellow-600">1,234</p>
            </div>
            <Download className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Certificate Templates */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-black">Certificate Templates</h4>
        </div>
        
        <div className="divide-y divide-gray-200">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${
                    cert.type === 'auto' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {cert.type === 'auto' ? (
                      <GraduationCap className={`w-6 h-6 ${
                        cert.type === 'auto' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                    ) : (
                      <Award className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-black">{cert.name}</h5>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        cert.type === 'auto' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {cert.type === 'auto' ? 'Auto-generated' : 'Custom Template'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        cert.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cert.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-black">{cert.issued} issued</p>
                    <p className="text-xs text-gray-500">Last used: {new Date(cert.lastUsed).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Used in:</span>
                  <span className="ml-1 font-medium text-black">{cert.coursesUsed} courses</span>
                </div>
                <div>
                  <span className="text-gray-600">Total downloads:</span>
                  <span className="ml-1 font-medium text-black">{Math.floor(cert.issued * 2.3)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Avg. rating:</span>
                  <span className="ml-1 font-medium text-black flex items-center">
                    4.8 <Star className="w-3 h-3 text-yellow-500 ml-1" fill="currentColor" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-lg text-white cursor-pointer"
          onClick={onCreateCertificate}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">Create Custom Template</h4>
              <p className="text-purple-100 text-sm">Design a personalized certificate template</p>
            </div>
            <Plus className="w-8 h-8 text-purple-200" />
          </div>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-lg text-white cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">Certificate Analytics</h4>
              <p className="text-blue-100 text-sm">View detailed certificate performance</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-200" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ dashboardData }) => {
  const monthlyData = dashboardData?.monthlyEarnings || [];
  const overview = dashboardData?.overview || {};
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-black font-serif">Course Analytics</h3>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
            <BarChart3 className="w-4 h-4 mr-2" />
            Advanced Analytics
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200 rounded-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+12%</span>
          </div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h4>
          <p className="text-2xl font-bold text-black">${overview.totalRevenue?.toLocaleString() || '0'}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200 rounded-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+8%</span>
          </div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Total Students</h4>
          <p className="text-2xl font-bold text-black">{overview.totalStudents?.toLocaleString() || '0'}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200 rounded-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">Rating</span>
          </div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Avg. Rating</h4>
          <p className="text-2xl font-bold text-black">{overview.averageRating || '0'}/5</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200 rounded-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-blue-600 font-medium">{overview.publishedCourses}/{overview.totalCourses}</span>
          </div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Published Courses</h4>
          <p className="text-2xl font-bold text-black">{overview.publishedCourses || '0'}</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
          <h4 className="text-lg font-semibold text-black mb-6">Monthly Revenue</h4>
          <div className="space-y-4">
            {monthlyData.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 w-12">{month.month}</span>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(month.earnings / Math.max(...monthlyData.map(m => m.earnings))) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="bg-purple-600 h-2 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-black w-16 text-right">
                  ${month.earnings?.toLocaleString() || '0'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Course Performance */}
        <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
          <h4 className="text-lg font-semibold text-black mb-6">Course Performance</h4>
          <div className="space-y-4">
            {dashboardData?.coursesBreakdown?.slice(0, 5).map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h5 className="font-medium text-black text-sm">{course.title}</h5>
                  <p className="text-xs text-gray-500">{course.students} students</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-black">${course.revenue?.toLocaleString() || '0'}</p>
                  <p className="text-xs text-gray-500">{course.rating}/5 ⭐</p>
                </div>
              </motion.div>
            )) || (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No course data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg">
        <h4 className="text-lg font-semibold text-black mb-6">Engagement Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-4 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
            <h5 className="font-semibold text-black mb-1">Course Views</h5>
            <p className="text-2xl font-bold text-purple-600">2,450</p>
            <p className="text-sm text-gray-500">This month</p>
          </div>
          
          <div className="text-center">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <Play className="w-8 h-8 text-blue-600" />
            </div>
            <h5 className="font-semibold text-black mb-1">Video Completions</h5>
            <p className="text-2xl font-bold text-blue-600">87%</p>
            <p className="text-sm text-gray-500">Average rate</p>
          </div>
          
          <div className="text-center">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
            <h5 className="font-semibold text-black mb-1">Student Interactions</h5>
            <p className="text-2xl font-bold text-green-600">142</p>
            <p className="text-sm text-gray-500">Comments & Questions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Course Creation Modal Component
const CourseCreationModal = ({ isOpen, onClose, onCourseCreated }) => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    subcategory: '',
    level: '',
    thumbnail: '',
    previewVideo: '',
    requirements: '',
    learningOutcomes: '',
    targetAudience: '',
    tags: '',
    language: 'English',
    price: '',
    discountPrice: '',
    estimatedCompletionTime: '',
    difficulty: 'Medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFileUpload = async (file, type) => {
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await axios.post('/courses/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data.url;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await handleFileUpload(file, 'image');
        setCourseData({ ...courseData, thumbnail: url });
      } catch (error) {
        setError('Failed to upload thumbnail');
      }
    }
  };

  const handlePreviewVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await handleFileUpload(file, 'video');
        setCourseData({ ...courseData, previewVideo: url });
      } catch (error) {
        setError('Failed to upload preview video');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const submitData = {
        ...courseData,
        requirements: courseData.requirements ? courseData.requirements.split('\n').filter(req => req.trim()) : [],
        learningOutcomes: courseData.learningOutcomes ? courseData.learningOutcomes.split('\n').filter(outcome => outcome.trim()) : [],
        targetAudience: courseData.targetAudience ? courseData.targetAudience.split('\n').filter(audience => audience.trim()) : [],
        tags: courseData.tags ? courseData.tags.split(',').map(tag => tag.trim()) : [],
        price: parseFloat(courseData.price) || 0,
        discountPrice: parseFloat(courseData.discountPrice) || undefined
      };
      
      const response = await axios.post('/courses', submitData);
      console.log('Course created:', response.data);
      onCourseCreated();
      onClose();
      setCourseData({ 
        title: '', description: '', shortDescription: '', category: '', subcategory: '', level: '', 
        thumbnail: '', previewVideo: '', requirements: '', learningOutcomes: '', targetAudience: '',
        tags: '', language: 'English', price: '', discountPrice: '', estimatedCompletionTime: '', difficulty: 'Medium'
      });
      setCurrentStep(1);
      setError('');
    } catch (error) {
      console.error('Error creating course:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.join(', ') || 
                          'Failed to create course. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setCurrentStep(1);
    onClose();
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl rounded-2xl border border-gray-100"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {/* Enhanced Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 rounded-t-2xl backdrop-blur-sm bg-white/95">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Course</h3>
                  <p className="text-gray-600 mt-1">Build an engaging learning experience for your students</p>
                </div>
              </div>
              <button 
                onClick={handleClose} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Enhanced Progress Steps */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      currentStep >= step 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg scale-105' 
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    }`}>
                      {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    {step < 4 && (
                      <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                        currentStep > step ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <span className={`text-sm font-medium transition-colors ${currentStep >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
                  Basic Details
                </span>
                <span className={`text-sm font-medium transition-colors ${currentStep >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
                  Content & Media
                </span>
                <span className={`text-sm font-medium transition-colors ${currentStep >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
                  Course Settings
                </span>
                <span className={`text-sm font-medium transition-colors ${currentStep >= 4 ? 'text-purple-600' : 'text-gray-400'}`}>
                  Review & Create
                </span>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Error creating course</h4>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Course Title *
                        </label>
                        <input
                          type="text"
                          value={courseData.title}
                          onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="e.g., Complete Python Programming Bootcamp"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Short Description
                        </label>
                        <input
                          type="text"
                          value={courseData.shortDescription}
                          onChange={(e) => setCourseData({ ...courseData, shortDescription: e.target.value })}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="Brief one-line description for course cards"
                          maxLength="200"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Detailed Description *
                        </label>
                        <textarea
                          value={courseData.description}
                          onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                          rows={6}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
                          placeholder="Describe what students will learn, the course structure, and what makes it valuable..."
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Category *
                          </label>
                          <select
                            value={courseData.category}
                            onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                            className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                            required
                          >
                            <option value="">Select category</option>
                            <option value="Programming">Programming</option>
                            <option value="Design">Design</option>
                            <option value="Business">Business</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Science">Science</option>
                            <option value="Language">Language</option>
                            <option value="Data Science">Data Science</option>
                            <option value="AI/ML">AI/ML</option>
                            <option value="Cybersecurity">Cybersecurity</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Difficulty Level *
                          </label>
                          <select
                            value={courseData.level}
                            onChange={(e) => setCourseData({ ...courseData, level: e.target.value })}
                            className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                            required
                          >
                            <option value="">Select level</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Content & Media */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {/* Thumbnail Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Course Thumbnail
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                        {courseData.thumbnail ? (
                          <div className="relative">
                            <img
                              src={courseData.thumbnail}
                              alt="Course thumbnail"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => setCourseData({ ...courseData, thumbnail: '' })}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">Upload course thumbnail (recommended: 1200x800px)</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailUpload}
                              className="hidden"
                              id="thumbnail-upload"
                              disabled={uploadingFile}
                            />
                            <label
                              htmlFor="thumbnail-upload"
                              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {uploadingFile ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Choose Image
                                </>
                              )}
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Preview Video Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Preview Video (Optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                        {courseData.previewVideo ? (
                          <div className="relative">
                            <video
                              src={courseData.previewVideo}
                              controls
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => setCourseData({ ...courseData, previewVideo: '' })}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">Upload a preview video to showcase your course</p>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handlePreviewVideoUpload}
                              className="hidden"
                              id="preview-video-upload"
                              disabled={uploadingFile}
                            />
                            <label
                              htmlFor="preview-video-upload"
                              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {uploadingFile ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Choose Video
                                </>
                              )}
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Course Content Areas */}
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          What will students learn? (Learning Outcomes)
                        </label>
                        <textarea
                          value={courseData.learningOutcomes}
                          onChange={(e) => setCourseData({ ...courseData, learningOutcomes: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
                          placeholder="List each learning outcome on a new line&#10;• Build full-stack web applications&#10;• Master React and Node.js&#10;• Deploy applications to production"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Course Requirements/Prerequisites
                        </label>
                        <textarea
                          value={courseData.requirements}
                          onChange={(e) => setCourseData({ ...courseData, requirements: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
                          placeholder="List each requirement on a new line&#10;Basic understanding of HTML/CSS&#10;No programming experience required&#10;Computer with internet connection"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Target Audience
                        </label>
                        <textarea
                          value={courseData.targetAudience}
                          onChange={(e) => setCourseData({ ...courseData, targetAudience: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-gray-900 placeholder-gray-400"
                          placeholder="Who is this course for?&#10;Beginner developers&#10;Career changers&#10;Students looking to learn programming"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Course Settings */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Estimated Completion Time
                        </label>
                        <input
                          type="text"
                          value={courseData.estimatedCompletionTime}
                          onChange={(e) => setCourseData({ ...courseData, estimatedCompletionTime: e.target.value })}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="e.g., 6 weeks at 3-4 hours/week"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Course Language
                        </label>
                        <select
                          value={courseData.language}
                          onChange={(e) => setCourseData({ ...courseData, language: e.target.value })}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="German">German</option>
                          <option value="Portuguese">Portuguese</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Course Price ($)
                        </label>
                        <input
                          type="number"
                          value={courseData.price}
                          onChange={(e) => setCourseData({ ...courseData, price: e.target.value })}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="0 for free"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Discount Price ($)
                        </label>
                        <input
                          type="number"
                          value={courseData.discountPrice}
                          onChange={(e) => setCourseData({ ...courseData, discountPrice: e.target.value })}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                          placeholder="Optional"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Difficulty Rating
                        </label>
                        <select
                          value={courseData.difficulty}
                          onChange={(e) => setCourseData({ ...courseData, difficulty: e.target.value })}
                          className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={courseData.tags}
                        onChange={(e) => setCourseData({ ...courseData, tags: e.target.value })}
                        className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                        placeholder="python, programming, beginner, web development, backend"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mr-4">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">Review Your Course</h4>
                          <p className="text-gray-600">Make sure everything looks perfect before creating</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-2">Basic Information</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex"><span className="font-medium text-gray-600 w-24">Title:</span> <span className="text-gray-900">{courseData.title || 'Not set'}</span></div>
                              <div className="flex"><span className="font-medium text-gray-600 w-24">Category:</span> <span className="text-gray-900">{courseData.category || 'Not set'}</span></div>
                              <div className="flex"><span className="font-medium text-gray-600 w-24">Level:</span> <span className="text-gray-900">{courseData.level || 'Not set'}</span></div>
                              <div className="flex"><span className="font-medium text-gray-600 w-24">Language:</span> <span className="text-gray-900">{courseData.language}</span></div>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-2">Pricing & Details</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex"><span className="font-medium text-gray-600 w-24">Price:</span> <span className="text-gray-900">${courseData.price || '0'} {courseData.discountPrice && `(was $${courseData.discountPrice})`}</span></div>
                              <div className="flex"><span className="font-medium text-gray-600 w-24">Duration:</span> <span className="text-gray-900">{courseData.estimatedCompletionTime || 'Not specified'}</span></div>
                              <div className="flex"><span className="font-medium text-gray-600 w-24">Difficulty:</span> <span className="text-gray-900">{courseData.difficulty}</span></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-2">Media</h5>
                            <div className="space-y-3">
                              {courseData.thumbnail && (
                                <div>
                                  <span className="text-sm font-medium text-gray-600">Thumbnail:</span>
                                  <img src={courseData.thumbnail} alt="Thumbnail" className="w-full h-24 object-cover rounded-lg mt-1" />
                                </div>
                              )}
                              {courseData.previewVideo && (
                                <div>
                                  <span className="text-sm font-medium text-gray-600">Preview Video: </span>
                                  <span className="text-sm text-green-600">✓ Uploaded</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-2">Tags</h5>
                            <div className="flex flex-wrap gap-2">
                              {courseData.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced Navigation */}
              <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-100">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                      Previous
                    </button>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Cancel
                  </button>
                  
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || uploadingFile}
                      className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          Creating Course...
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-5 h-5 mr-3" />
                          Create Course
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Certificate Creation Modal Component
const CertificateCreationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white max-w-md w-full p-6 shadow-xl"
        >
          <div className="text-center">
            <Award className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-black mb-2">Certificate Management</h3>
            <p className="text-gray-600 mb-6">Certificate creation and management tools coming soon!</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstructorDashboard;
