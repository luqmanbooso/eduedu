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
      const response = await axios.get('/api/instructor/stats');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching instructor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorCourses = async () => {
    try {
      const response = await axios.get('/api/instructor/courses');
      setInstructorCourses(response.data);
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/instructor/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
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
              value={dashboardData.totalStudents || students.length}
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
              <AnalyticsTab />
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
        {students.slice(0, 4).map((student, index) => (
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
const CoursesTab = ({ courses, onCreateCourse }) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl font-bold text-black font-serif">My Courses</h3>
      <motion.button
        onClick={onCreateCourse}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Course
      </motion.button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course, index) => (
        <motion.div
          key={course._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ y: -4 }}
          className="bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <img
            src={course.thumbnail || '/api/placeholder/300/200'}
            alt={course.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h4 className="text-lg font-semibold text-black mb-2">{course.title}</h4>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">
                {course.enrolledStudents?.length || 0} students
              </span>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-purple-500" fill="currentColor" />
                <span className="text-sm font-medium">{course.rating || '4.8'}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Link
                to={`/courses/${course._id}/edit`}
                className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Edit
              </Link>
              <Link
                to={`/courses/${course._id}`}
                className="flex-1 text-center px-3 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                View
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

// Students Tab Component
const StudentsTab = ({ students }) => (
  <div>
    <h3 className="text-2xl font-bold text-black font-serif mb-6">Student Management</h3>
    
    <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-black">Enrolled Students</h4>
          <span className="text-sm text-gray-500">{students.length} total students</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student, index) => (
              <motion.tr
                key={student._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-600 flex items-center justify-center text-white font-medium">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-black">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.course}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 h-2">
                      <div 
                        className="bg-purple-600 h-2 transition-all duration-500"
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                    student.grade >= 90 ? 'bg-green-100 text-green-800' :
                    student.grade >= 80 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.grade}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-purple-600 hover:text-purple-700">View</button>
                    <button className="text-gray-600 hover:text-gray-700">Message</button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Certificates Tab Component
const CertificatesTab = ({ onCreateCertificate }) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl font-bold text-black font-serif">Certificate Management</h3>
      <motion.button
        onClick={onCreateCertificate}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Certificate Template
      </motion.button>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center space-x-3 mb-4">
          <GraduationCap className="w-8 h-8 text-purple-600" />
          <div>
            <h4 className="text-lg font-semibold text-black">Course Completion</h4>
            <p className="text-sm text-gray-600">Auto-generated certificates</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Certificates Issued</span>
            <span className="text-sm font-medium text-black">247</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">This Month</span>
            <span className="text-sm font-medium text-green-600">+23</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center space-x-3 mb-4">
          <Award className="w-8 h-8 text-purple-600" />
          <div>
            <h4 className="text-lg font-semibold text-black">Custom Templates</h4>
            <p className="text-sm text-gray-600">Personalized certificates</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Active Templates</span>
            <span className="text-sm font-medium text-black">5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Downloads</span>
            <span className="text-sm font-medium text-purple-600">1,234</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Analytics Tab Component
const AnalyticsTab = () => (
  <div>
    <h3 className="text-2xl font-bold text-black font-serif mb-6">Course Analytics</h3>
    <div className="bg-white border border-gray-200 p-6 shadow-sm">
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-black mb-2">Analytics Dashboard</h4>
        <p className="text-gray-600 mb-4">Detailed analytics and reporting tools</p>
        <button className="px-6 py-3 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors">
          View Full Analytics
        </button>
      </div>
    </div>
  </div>
);

// Course Creation Modal Component
const CourseCreationModal = ({ isOpen, onClose, onCourseCreated }) => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail: '',
    price: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/courses', courseData);
      onCourseCreated();
      onClose();
      setCourseData({ title: '', description: '', category: '', thumbnail: '', price: 0 });
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-black">Create New Course</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
              <input
                type="text"
                value={courseData.title}
                onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={courseData.description}
                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={courseData.category}
                onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600"
                required
              >
                <option value="">Select a category</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors"
              >
                Create Course
              </button>
            </div>
          </form>
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
