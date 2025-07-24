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
  Layers,
  GraduationCap,
  Sparkles,
  Target,
  Heart,
  Zap,
  ChevronDown,
  UserPlus,
  BookPlus,
  BarChart2,
  Cog
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { contactAPI } from '../services/api';

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
  const [contactMessages, setContactMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replySuccess, setReplySuccess] = useState(null);

  useEffect(() => {
    fetchAdminData();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (activeTab === 'messaging') {
      fetchContactMessages();
    }
    // eslint-disable-next-line
  }, [activeTab]);

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

  const fetchContactMessages = async () => {
    setLoadingMessages(true);
    try {
      const data = await contactAPI.getContactMessages();
      setContactMessages(data);
    } catch (err) {
      setContactMessages([]);
    } finally {
      setLoadingMessages(false);
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

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await contactAPI.deleteContactMessage(id);
      setContactMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (err) {
      alert('Failed to delete message.');
    }
  };

  const handleViewMessage = (msg) => {
    setSelectedMessage(msg);
    setReplyText('');
    setReplySuccess(null);
    setShowMessageModal(true);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    setReplySuccess(null);
    try {
      // Call backend API to send reply email
      await contactAPI.replyToContactMessage(selectedMessage._id, { message: replyText });
      setReplySuccess('success');
      setReplyText('');
    } catch (err) {
      setReplySuccess('error');
    } finally {
      setReplyLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: UserPlus, count: users.length },
    { id: 'courses', label: 'Courses', icon: GraduationCap, count: courses.length },
    { id: 'pending', label: 'Pending Review', icon: Clock, count: pendingCourses.length },
    { id: 'content', label: 'Content', icon: Layers },
    { id: 'messaging', label: 'Messages', icon: MessageSquare, count: contactMessages.length },
    { id: 'reports', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Cog },
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
      <div className="bg-white border-l-4 border-purple-600 p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-3 font-serif">Welcome Back</h1>
            <p className="text-gray-600 text-lg font-medium font-serif">Manage your platform efficiently</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-purple-600 font-serif">Admin Dashboard</p>
            <p className="text-xs text-gray-500 font-serif">EduCharity Platform</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1 font-serif">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 font-serif">{adminStats?.totalUsers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-600 font-bold text-sm font-serif">+{adminStats?.recentUsers || 0}</span>
            <span className="text-gray-500 text-sm ml-1 font-serif">this month</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1 font-serif">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900 font-serif">{adminStats?.totalCourses || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-purple-600 font-bold text-sm font-serif">{adminStats?.publishedCourses || 0}</span>
            <span className="text-gray-500 text-sm ml-1 font-serif">published</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1 font-serif">Students</p>
              <p className="text-3xl font-bold text-gray-900 font-serif">{adminStats?.totalStudents || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-green-600 font-bold text-sm font-serif">{Math.round(((adminStats?.totalStudents || 0) / (adminStats?.totalUsers || 1)) * 100)}%</span>
            <span className="text-gray-500 text-sm ml-1 font-serif">of users</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1 font-serif">Instructors</p>
              <p className="text-3xl font-bold text-gray-900 font-serif">{adminStats?.totalInstructors || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-orange-600 font-bold text-sm font-serif">{Math.round(((adminStats?.totalInstructors || 0) / (adminStats?.totalUsers || 1)) * 100)}%</span>
            <span className="text-gray-500 text-sm ml-1 font-serif">of users</span>
          </div>
        </motion.div>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 font-serif">Recent Activity</h3>
            <button className="text-purple-600 hover:text-purple-800 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-purple-50 transition-all font-serif">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {Array.isArray(notifications) && notifications.length > 0 ? notifications.slice(0, 5).map((notification, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 font-serif">{notification.message || 'System activity'}</p>
                  <p className="text-xs text-gray-500 mt-1 font-serif">{notification.time || 'Recently'}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-serif">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pending Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 font-serif">Pending Actions</h3>
            <button
              onClick={() => setActiveTab('pending')}
              className="text-purple-600 hover:text-purple-800 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-purple-50 transition-all font-serif"
            >
              Review All
            </button>
          </div>
          <div className="space-y-4">
            {pendingCourses.length > 0 ? pendingCourses.slice(0, 3).map((course, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-5 h-5 text-yellow-600" />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 font-serif">{course.title}</span>
                    <p className="text-xs text-gray-500 font-serif">Course pending review</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('pending')}
                  className="text-xs bg-yellow-600 text-white px-3 py-1 rounded-full hover:bg-yellow-700 transition-colors font-medium font-serif"
                >
                  Review
                </button>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-serif">No pending actions</p>
              </div>
            )}
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

  const MessagesView = ({ onViewMessage }) => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Messages</h2>
      {loadingMessages ? (
        <div className="text-center py-8">Loading messages...</div>
      ) : contactMessages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No messages found.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-lg bg-white">
          <table className="min-w-full bg-white rounded-2xl overflow-hidden">
            <thead>
              <tr className="bg-[#f3f0fa] border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-black">User</th>
                <th className="px-4 py-3 text-left font-semibold text-black">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-black">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-black">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-black">Message</th>
                <th className="px-4 py-3 text-left font-semibold text-black">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-black">Action</th>
              </tr>
            </thead>
            <tbody>
              {contactMessages.map((msg) => (
                <tr key={msg._id} className="border-b border-gray-100 hover:bg-[#f8f6fd] transition-colors group">
                  <td className="px-4 py-3 text-sm text-black/90 font-medium">{msg.name || msg.user?.name}</td>
                  <td className="px-4 py-3 text-sm text-black/70">{msg.email || msg.user?.email}</td>
                  <td className="px-4 py-3 text-sm text-black/80">{msg.subject}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-purple-700 uppercase">{msg.type}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-black/70" title={msg.message}>{msg.message}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 flex gap-2 items-center">
                    <button
                      onClick={() => onViewMessage(msg)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                      title="View"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      <span className="hidden md:inline">View</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                      title="Reject"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6" /></svg>
                      <span className="hidden md:inline">Reject</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'users': return renderUsers();
      case 'courses': return renderCourses();
      case 'pending': return renderPendingReview();
      case 'content': return renderContent();
      case 'messaging': return <MessagesView onViewMessage={handleViewMessage} />;
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
          <p className="text-gray-600 font-serif">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-serif">Processing...</p>
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
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black font-serif">EduCharity</h1>
                <p className="text-xs text-gray-500 -mt-0.5 font-serif">Admin Panel</p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all relative"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white shadow-xl border border-gray-100 rounded-xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map((notification, index) => (
                          <div key={index} className="p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors">
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="p-6 text-center">
                            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No notifications</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold text-black font-serif">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 font-serif">{user?.email || 'admin@educarity.com'}</p>
                </div>
                <button 
                  onClick={logout}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    isActive
                      ? 'border-purple-600 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  } whitespace-nowrap py-3 px-4 border-b-2 font-bold text-sm flex items-center space-x-2 transition-all font-serif`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 text-xs font-bold rounded-full ${
                      isActive 
                        ? 'bg-purple-200 text-purple-800' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-0 relative overflow-hidden border border-purple-100">
            {/* Header Gradient */}
            <div className="bg-gradient-to-r from-[#a435f0] to-[#6a11cb] px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-extrabold text-white mb-1 font-serif">Message Details</h3>
                <p className="text-purple-100 text-sm font-medium">Contacted on {new Date(selectedMessage.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setShowMessageModal(false)} className="text-purple-100 hover:text-white text-3xl font-bold ml-4">&times;</button>
            </div>
            {/* Content */}
            <div className="px-8 py-6">
              <div className="mb-4 space-y-1">
                <div><span className="font-semibold text-gray-700">User:</span> {selectedMessage.name || selectedMessage.user?.name}</div>
                <div><span className="font-semibold text-gray-700">Email:</span> {selectedMessage.email || selectedMessage.user?.email}</div>
                <div><span className="font-semibold text-gray-700">Subject:</span> {selectedMessage.subject}</div>
                <div><span className="font-semibold text-gray-700">Type:</span> {selectedMessage.type}</div>
                <div className="font-semibold text-gray-700">Message:</div>
                <div className="bg-gray-50 border border-purple-100 rounded p-3 mt-1 text-gray-800 whitespace-pre-line shadow-inner">{selectedMessage.message}</div>
              </div>
              <div className="border-t pt-6 mt-6">
                <h4 className="font-bold mb-2 text-[#a435f0] text-lg font-serif">Reply to User</h4>
                <textarea
                  className="w-full border border-purple-200 rounded-lg p-3 mb-2 focus:ring-2 focus:ring-[#a435f0] focus:border-[#a435f0] transition shadow-sm"
                  rows={3}
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  disabled={replyLoading}
                  style={{ fontFamily: 'inherit' }}
                />
                <button
                  onClick={async () => {
                    setReplyLoading(true);
                    setReplySuccess(null);
                    try {
                      await contactAPI.replyToContactMessage(selectedMessage._id, { message: replyText });
                      setReplySuccess('success');
                      setReplyText('');
                    } catch (err) {
                      setReplySuccess('error');
                    } finally {
                      setReplyLoading(false);
                    }
                  }}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-purple-700 transition disabled:opacity-50"
                  disabled={replyLoading || !replyText.trim()}
                >
                  {replyLoading ? 'Sending Reply...' : 'Send Reply'}
                </button>
                {replySuccess === 'success' && (
                  <div className="mt-4 flex items-center text-green-600 font-semibold"><svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Reply sent successfully!</div>
                )}
                {replySuccess === 'error' && (
                  <div className="mt-4 flex items-center text-red-600 font-semibold"><svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Failed to send reply.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
