import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Shield,
  Bell,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Crown,
  Mail,
  Calendar,
  FileText,
  Activity,
  Globe,
  MessageSquare,
  Archive,
  Download,
  Upload,
  RefreshCw,
  LogOut,
  Home,
  X,
  Check,
  Star,
  AlertTriangle,
  PieChart,
  Layers
} from 'lucide-react';
import { adminAPI } from '../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminStats, setAdminStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserRole, setSelectedUserRole] = useState('all');
  const [selectedCourseStatus, setSelectedCourseStatus] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  useEffect(() => {
    fetchAdminData();
    fetchNotifications();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, coursesRes, pendingRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAllUsers({ limit: 100 }),
        adminAPI.getAllCourses({ limit: 100 }),
        adminAPI.getPendingCourses()
      ]);
      
      setAdminStats(statsRes.overview);
      setUsers(usersRes.users || []);
      setCourses(coursesRes.courses || []);
      setPendingCourses(pendingRes.courses || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      // Set empty states on error
      setAdminStats({});
      setUsers([]);
      setCourses([]);
      setPendingCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await adminAPI.getNotifications();
      // Handle the response structure from the backend
      const notificationsData = response?.notifications || response || [];
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const handleUserStatusChange = async (userId, action) => {
    try {
      setActionLoading(true);
      const isActive = action === 'activate';
      await adminAPI.updateUser(userId, { isActive });
      await fetchAdminData();
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(true);
      await adminAPI.updateUser(userId, { role: newRole });
      await fetchAdminData();
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCourseStatusChange = async (courseId, action) => {
    try {
      setActionLoading(true);
      let status;
      switch (action) {
        case 'publish':
          status = 'published';
          break;
        case 'unpublish':
          status = 'draft';
          break;
        case 'archive':
          status = 'archived';
          break;
        default:
          status = action;
      }
      await adminAPI.updateCourseStatus(courseId, status);
      await fetchAdminData();
    } catch (error) {
      console.error('Error updating course:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      await adminAPI.deleteCourse(courseId);
      await fetchAdminData();
    } catch (error) {
      console.error('Error deleting course:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      await adminAPI.deleteUser(userId);
      await fetchAdminData();
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'courses', label: 'Courses', icon: BookOpen, count: courses.length },
    { id: 'pending', label: 'Pending Review', icon: Clock, count: pendingCourses.length },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedUserRole === 'all' || user.role === selectedUserRole;
    return matchesSearch && matchesRole;
  });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedCourseStatus === 'all' || 
                         (selectedCourseStatus === 'published' && course.isPublished) ||
                         (selectedCourseStatus === 'unpublished' && !course.isPublished) ||
                         course.status === selectedCourseStatus;
    return matchesSearch && matchesStatus;
  });

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-indigo-100 text-lg">Here's what's happening with your platform today.</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Back to Site</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{adminStats?.totalUsers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            <span className="text-green-600 font-medium">+{adminStats?.recentUsers || 0}</span> this month
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">{adminStats?.totalCourses || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            <span className="text-blue-600 font-medium">{adminStats?.publishedCourses || 0}</span> published
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="text-3xl font-bold text-gray-900">{adminStats?.totalStudents || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            <span className="text-green-600 font-medium">{Math.round(((adminStats?.totalStudents || 0) / (adminStats?.totalUsers || 1)) * 100)}%</span> of total users
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Instructors</p>
              <p className="text-3xl font-bold text-gray-900">{adminStats?.totalInstructors || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 flex items-center justify-center">
              <Crown className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            <span className="text-blue-600 font-medium">{Math.round(((adminStats?.totalInstructors || 0) / (adminStats?.totalUsers || 1)) * 100)}%</span> of total users
          </p>
        </motion.div>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {Array.isArray(notifications) && notifications.length > 0 ? notifications.slice(0, 5).map((notification, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-2 h-2 bg-indigo-500 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{notification.message || 'System activity'}</p>
                  <p className="text-xs text-gray-500">{notification.time || 'Recently'}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pending Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Pending Actions</h3>
            <button
              onClick={() => setActiveTab('pending')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Review All
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Courses pending review</span>
                  <p className="text-xs text-gray-500">Awaiting admin approval</p>
                </div>
              </div>
              <span className="text-sm font-bold text-yellow-600">{pendingCourses.length}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="text-sm font-medium text-gray-900">New user registrations</span>
                  <p className="text-xs text-gray-500">This week</p>
                </div>
              </div>
              <span className="text-sm font-bold text-blue-600">{adminStats?.recentUsers || 0}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={selectedUserRole}
            onChange={(e) => setSelectedUserRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <motion.tr 
                  key={user._id} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 object-cover"
                          src={user.avatar || '/api/placeholder/40/40'}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleUserRoleChange(user._id, e.target.value)}
                      disabled={actionLoading}
                      className="text-sm border border-gray-300 px-2 py-1 disabled:opacity-50"
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold ${
                      user.isActive !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUserStatusChange(user._id, user.isActive !== false ? 'deactivate' : 'activate')}
                        disabled={actionLoading}
                        className={`text-xs px-3 py-1 transition-colors disabled:opacity-50 ${
                          user.isActive !== false 
                            ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {user.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900 p-1">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={actionLoading}
                        className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

  const renderCourses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={selectedCourseStatus}
            onChange={(e) => setSelectedCourseStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
            <option value="draft">Draft</option>
            <option value="review">Under Review</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <motion.div 
            key={course._id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <img
                src={course.thumbnail?.url || '/api/placeholder/300/200'}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all"></div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 text-xs font-semibold ${
                  course.isPublished ? 'bg-green-100 text-green-800' :
                  course.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                  course.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.isPublished ? 'Published' : course.status || 'Draft'}
                </span>
                <span className="text-sm text-gray-500">{course.category}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{course.instructor?.name}</span>
                <span>{course.enrolledStudents?.length || 0} enrolled</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCourseStatusChange(course._id, course.isPublished ? 'unpublish' : 'publish')}
                  disabled={actionLoading}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                    course.isPublished 
                      ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {course.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button 
                  onClick={() => {
                    setSelectedCourse(course);
                    setShowCourseModal(true);
                  }}
                  className="px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteCourse(course._id)}
                  disabled={actionLoading}
                  className="px-3 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderPendingReview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pending Course Reviews</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{pendingCourses.length} courses pending</span>
          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {pendingCourses.length === 0 ? (
        <div className="bg-white p-8 shadow-sm border border-gray-100 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-500">No courses are currently pending review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingCourses.map((course) => (
            <motion.div 
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={course.thumbnail?.url || '/api/placeholder/120/80'}
                  alt={course.title}
                  className="w-24 h-16 object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>By {course.instructor?.name}</span>
                        <span>{course.category}</span>
                        <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleCourseStatusChange(course._id, 'published')}
                        disabled={actionLoading}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleCourseStatusChange(course._id, 'draft', 'Needs revision')}
                        disabled={actionLoading}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowCourseModal(true);
                        }}
                        className="px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Upload className="w-5 h-5 text-indigo-600" />
                <span className="text-sm text-gray-900">Videos</span>
              </div>
              <span className="text-sm text-gray-500">1.2 GB used</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-900">Documents</span>
              </div>
              <span className="text-sm text-gray-500">45 MB used</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Archive className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-900">Images</span>
              </div>
              <span className="text-sm text-gray-500">128 MB used</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Review</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-gray-900">Pending Review</span>
              </div>
              <span className="text-sm font-medium text-yellow-600">{pendingCourses.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-gray-900">Flagged Content</span>
              </div>
              <span className="text-sm font-medium text-red-600">0</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-indigo-600" />
                <span className="text-sm text-gray-900">User Report</span>
              </div>
              <span className="text-sm text-gray-500">CSV</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-900">Course Report</span>
              </div>
              <span className="text-sm text-gray-500">Excel</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-900">Activity Report</span>
              </div>
              <span className="text-sm text-gray-500">PDF</span>
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Analytics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Enrollments</span>
              <span className="text-sm font-medium text-gray-900">{adminStats?.totalEnrollments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Course Completions</span>
              <span className="text-sm font-medium text-gray-900">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active This Month</span>
              <span className="text-sm font-medium text-gray-900">{adminStats?.recentUsers || 0}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">User Registration</label>
                <p className="text-sm text-gray-500">Allow new users to register</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Verification</label>
                <p className="text-sm text-gray-500">Require email verification</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Course Approval</label>
                <p className="text-sm text-gray-500">Require admin approval for courses</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                <p className="text-sm text-gray-500">Enable 2FA for all users</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Login Monitoring</label>
                <p className="text-sm text-gray-500">Track suspicious login attempts</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  const CourseModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Course Details</h3>
            <button
              onClick={() => setShowCourseModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {selectedCourse && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedCourse.thumbnail?.url || '/api/placeholder/400/250'}
                    alt={selectedCourse.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedCourse.title}</h4>
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                    <span>{selectedCourse.category}</span>
                    <span>{selectedCourse.level || 'Beginner'}</span>
                    <span className={`px-2 py-1 text-xs font-semibold ${
                      selectedCourse.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedCourse.isPublished ? 'Published' : selectedCourse.status || 'Draft'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Instructor:</span>
                      <span className="font-medium">{selectedCourse.instructor?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Enrolled:</span>
                      <span className="font-medium">{selectedCourse.enrolledStudents?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{new Date(selectedCourse.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Description</h5>
                <p className="text-gray-700 text-sm">{selectedCourse.description}</p>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                {selectedCourse.status === 'review' && (
                  <>
                    <button
                      onClick={() => {
                        handleCourseStatusChange(selectedCourse._id, 'published');
                        setShowCourseModal(false);
                      }}
                      disabled={actionLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        handleCourseStatusChange(selectedCourse._id, 'draft', 'Needs revision');
                        setShowCourseModal(false);
                      }}
                      disabled={actionLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'users': return renderUsers();
      case 'courses': return renderCourses();
      case 'pending': return renderPendingReview();
      case 'content': return renderContent();
      case 'reports': return renderReports();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Overlay */}
      <AnimatePresence>
        {actionLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40"
          >
            <div className="bg-white p-6 shadow-lg text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Modal */}
      <AnimatePresence>
        {showCourseModal && <CourseModal />}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-500 relative"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-white shadow-lg border border-gray-200 z-50"
                    >
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Notifications</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {notifications.length > 0 ? notifications.map((notification, index) => (
                            <div key={index} className="p-2 hover:bg-gray-50 text-sm">
                              <p className="text-gray-900">{notification.message}</p>
                              <p className="text-gray-500 text-xs">{notification.time}</p>
                            </div>
                          )) : (
                            <p className="text-gray-500 text-sm">No notifications</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex items-center space-x-3">
                <img
                  className="h-8 w-8 object-cover"
                  src={user?.avatar || '/api/placeholder/32/32'}
                  alt=""
                />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button 
                  onClick={logout}
                  className="text-gray-400 hover:text-gray-500 ml-2"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 text-xs font-medium">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
