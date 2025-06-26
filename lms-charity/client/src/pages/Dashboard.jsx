import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
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
  Plus
} from 'lucide-react';
import axios from 'axios';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import CertificateManager from '../components/CertificateManager';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    fetchRecentCourses();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/profile/stats');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentCourses = async () => {
    try {
      const response = await axios.get('/api/progress/user/all');
      setRecentCourses(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent courses:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'certificates', label: 'Certificates', icon: Award }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-lg text-gray-600">
                {user.role === 'student' && "Continue your learning journey and unlock new possibilities"}
                {user.role === 'instructor' && "Inspire minds and shape the future through teaching"}
                {user.role === 'admin' && "Oversee platform operations and drive growth"}
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden md:block"
            >
              <Link
                to="/courses"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Explore Courses
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            {dashboardData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                  title={user.role === 'student' ? 'Enrolled Courses' : 'Created Courses'}
                  value={user.role === 'student' ? dashboardData.courses.enrolled : dashboardData.courses.created}
                  icon={<BookOpen className="h-6 w-6" />}
                  color="bg-blue-500"
                  change={5}
                />
                <DashboardCard
                  title="Certificates Earned"
                  value={dashboardData.general.certificatesEarned}
                  icon={<Award className="h-6 w-6" />}
                  color="bg-green-500"
                  change={12}
                />
                <DashboardCard
                  title="Learning Hours"
                  value={`${Math.round(dashboardData.general.totalLearningTime / 60)}h`}
                  icon={<Clock className="h-6 w-6" />}
                  color="bg-purple-500"
                  change={8}
                />
                <DashboardCard
                  title="Completed Courses"
                  value={dashboardData.general.coursesCompleted}
                  icon={<Target className="h-6 w-6" />}
                  color="bg-orange-500"
                  change={3}
                />
              </div>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Learning
                  </h2>
                  <Link
                    to="/courses"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
                  >
                    View all courses
                  </Link>
                </div>
                
                {recentCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No recent activity
                    </p>
                    <Link
                      to="/courses"
                      className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Plus size={16} />
                      <span>Browse Courses</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCourses.map((progress) => (
                      <div
                        key={progress._id}
                        className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <img
                          src={progress.course.thumbnail || '/api/placeholder/48/48'}
                          alt={progress.course.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {progress.course.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${progress.progressPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {progress.progressPercentage}%
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/courses/${progress.course._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          {progress.progressPercentage === 100 ? (
                            <CheckCircle size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Quick Actions
                </h2>
                <div className="space-y-4">
                  <Link
                    to="/courses"
                    className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Browse Courses
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Discover new learning opportunities
                      </p>
                    </div>
                  </Link>
                  
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        View Certificates
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        See your achievements
                      </p>
                    </div>
                  </Link>

                  {(user.role === 'instructor' || user.role === 'admin') && (
                    <Link
                      to="/create-course"
                      className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                      <Plus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Create Course
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Share your knowledge
                        </p>
                      </div>
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard type="student" />}
        {activeTab === 'certificates' && <CertificateManager />}
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
    <div className="flex items-center">
      <div className={`${color} text-white p-3 rounded-lg`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ title, time }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
    <span className="text-gray-900 dark:text-white">{title}</span>
    <span className="text-sm text-gray-500 dark:text-gray-400">{time}</span>
  </div>
);

const QuickActionButton = ({ title }) => (
  <button className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-900 dark:text-white">
    {title}
  </button>
);

export default Dashboard;
