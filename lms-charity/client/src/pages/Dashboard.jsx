import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
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
  GraduationCap
} from 'lucide-react';
import axios from 'axios';
import { progressAPI, enrollmentAPI } from '../services/api';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import CertificateManager from '../components/CertificateManager';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect users to their role-specific dashboards
  if (user && user.role === 'instructor') {
    return <Navigate to="/instructor/dashboard" replace />;
  }
  
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    fetchDashboardData();
    fetchRecentCourses();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Use the progress analytics endpoint
      const response = await progressAPI.getAnalytics();
      console.log('=== Dashboard Analytics Response ===');
      console.log('Response:', response);
      console.log('Total courses:', response.overview?.totalCourses || 0);
      console.log('Completed courses:', response.overview?.completedCourses || 0);
      console.log('In progress courses:', response.overview?.inProgressCourses || 0);
      setDashboardData(response);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default data if API fails
      setDashboardData({
        overview: {
          totalCourses: 0,
          completedCourses: 0,
          totalLearningTime: 0,
          currentStreak: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentCourses = async () => {
    try {
      const response = await enrollmentAPI.getEnrolledCourses();
      setRecentCourses(response.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching recent courses:', error);
      setRecentCourses([]);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'certificates', label: 'Certificates', icon: Award }
  ];

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
                Welcome back, {user.name}
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
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Explore Courses
              </Link>
            </motion.div>
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
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            {dashboardData && dashboardData.overview && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                  title={user.role === 'student' ? 'Enrolled Courses' : 'Created Courses'}
                  value={user.role === 'student' ? dashboardData.overview.totalCourses : dashboardData.overview.totalCourses}
                  icon={<BookOpen className="h-6 w-6" />}
                  color="bg-purple-600"
                  change={5}
                />
                <DashboardCard
                  title="Completed Courses"
                  value={dashboardData.overview.completedCourses || 0}
                  icon={<Award className="h-6 w-6" />}
                  color="bg-black"
                  change={12}
                />
                <DashboardCard
                  title="Learning Hours"
                  value={`${Math.round((dashboardData.overview.totalLearningTime || 0) / 60)}h`}
                  icon={<Clock className="h-6 w-6" />}
                  color="bg-purple-500"
                  change={8}
                />
                <DashboardCard
                  title="Current Streak"
                  value={`${dashboardData.overview.currentStreak || 0} days`}
                  icon={<Target className="h-6 w-6" />}
                  color="bg-gray-800"
                  change={3}
                />
              </div>
            )}

            {/* Quick Actions for Students */}
            {user.role === 'student' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-r from-purple-600 to-purple-700 p-8 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Continue Your Learning Journey</h2>
                    <p className="text-purple-100 mb-6">
                      Pick up where you left off and track your progress across all courses
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link
                        to="/my-learning"
                        className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-medium hover:bg-gray-50 transition-colors duration-200"
                      >
                        <BookOpen className="w-5 h-5 mr-2" />
                        My Learning
                      </Link>
                      <Link
                        to="/courses"
                        className="inline-flex items-center px-6 py-3 bg-purple-800 text-white font-medium hover:bg-purple-900 transition-colors duration-200"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Browse Courses
                      </Link>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-16 h-16 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-black">
                    Recent Learning
                  </h2>
                  <Link
                    to="/my-learning"
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
                  >
                    View My Learning
                  </Link>
                </div>
                
                {recentCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">
                      No recent activity
                    </p>
                    <Link
                      to="/courses"
                      className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                    >
                      <Plus size={16} />
                      <span>Browse Courses</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCourses.map((course) => (
                      <motion.div
                        key={course.courseId}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center space-x-4 p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <img
                          src={course.thumbnail?.url || '/api/placeholder/48/48'}
                          alt={course.title}
                          className="w-12 h-12 object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-black">
                            {course.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-32 bg-gray-200 h-2">
                              <div
                                className="bg-purple-600 h-2"
                                style={{ width: `${course.progress?.percentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {Math.round(course.progress?.percentage || 0)}%
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/learn/${course.courseId}`}
                          className="p-2 text-purple-600 hover:bg-purple-50 transition-colors"
                        >
                          {course.progress?.percentage === 100 ? (
                            <CheckCircle size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <h2 className="text-xl font-semibold text-black mb-6">
                  Quick Actions
                </h2>
                <div className="space-y-4">
                  <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                    <Link
                      to="/courses"
                      className="flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 transition-colors"
                    >
                      <BookOpen className="w-6 h-6 text-purple-600" />
                      <div>
                        <h3 className="font-medium text-black">
                          Browse Courses
                        </h3>
                        <p className="text-sm text-gray-600">
                          Discover new learning opportunities
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <Award className="w-6 h-6 text-black" />
                      <div>
                        <h3 className="font-medium text-black">
                          View Certificates
                        </h3>
                        <p className="text-sm text-gray-600">
                          See your achievements
                        </p>
                      </div>
                    </Link>
                  </motion.div>

                  {(user.role === 'instructor' || user.role === 'admin') && (
                    <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                      <Link
                        to="/create-course"
                        className="flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 transition-colors"
                      >
                        <Plus className="w-6 h-6 text-purple-600" />
                        <div>
                          <h3 className="font-medium text-black">
                            Create Course
                          </h3>
                          <p className="text-sm text-gray-600">
                            Share your knowledge
                          </p>
                        </div>
                      </Link>
                    </motion.div>
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
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
    className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
  >
    <div className="flex items-center">
      <div className={`${color} text-white p-3`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-black">{value}</p>
      </div>
    </div>
  </motion.div>
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
