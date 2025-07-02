import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Award, 
  BookOpen, 
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AnalyticsDashboard = ({ type = 'student', dashboardData }) => {
  const [analytics, setAnalytics] = useState(dashboardData || null);
  const [loading, setLoading] = useState(!dashboardData);
  const [timeRange, setTimeRange] = useState('7d');
  const { user } = useAuth();

  useEffect(() => {
    if (!dashboardData) {
      fetchAnalytics();
    }
  }, [timeRange, type, dashboardData]);

  const fetchAnalytics = async () => {
    if (dashboardData) {
      setAnalytics(dashboardData);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const endpoint = type === 'student' 
        ? '/api/progress/analytics/user'
        : `/api/progress/analytics/course/${user.courseId}`;
      
      const response = await axios.get(endpoint);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-16">
        <BarChart3 size={64} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Analytics Data
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start learning to see your progress analytics!
        </p>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`text-sm flex items-center mt-1 ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp size={16} className="mr-1" />
              {change > 0 ? '+' : ''}{change}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon size={24} className={`text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </motion.div>
  );

  // Sample data for charts (replace with real data)
  const learningProgressData = [
    { name: 'Mon', hours: 2.5 },
    { name: 'Tue', hours: 3.2 },
    { name: 'Wed', hours: 1.8 },
    { name: 'Thu', hours: 4.1 },
    { name: 'Fri', hours: 2.9 },
    { name: 'Sat', hours: 3.7 },
    { name: 'Sun', hours: 2.3 }
  ];

  const categoryData = analytics && analytics.categoryStats 
    ? Object.entries(analytics.categoryStats).map(([name, stats]) => ({
        name,
        value: typeof stats === 'object' && stats !== null && stats.completed !== undefined ? stats.completed : 0,
        total: typeof stats === 'object' && stats !== null && stats.total !== undefined ? stats.total : 0
      }))
    : [];

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {type === 'student' ? 'Learning Analytics' : 'Course Analytics'}
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 3 months</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {type === 'student' ? (
          <>
            <StatCard
              icon={BookOpen}
              title="Courses Enrolled"
              value={analytics.overview.totalCourses}
              change={5}
              color="blue"
            />
            <StatCard
              icon={Award}
              title="Courses Completed"
              value={analytics.overview.completedCourses}
              change={12}
              color="green"
            />
            <StatCard
              icon={Clock}
              title="Learning Time"
              value={`${Math.round(analytics.overview.totalLearningTime / 60)}h`}
              change={8}
              color="purple"
            />
            <StatCard
              icon={Target}
              title="Average Progress"
              value={`${analytics.overview.averageProgress}%`}
              change={3}
              color="yellow"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={BookOpen}
              title="Total Students"
              value={analytics.overview.totalStudents}
              change={5}
              color="blue"
            />
            <StatCard
              icon={Award}
              title="Completion Rate"
              value={`${Math.round(analytics.overview.completionRate)}%`}
              change={12}
              color="green"
            />
            <StatCard
              icon={Clock}
              title="Avg. Study Time"
              value={`${Math.round(analytics.overview.averageTimePerStudent / 60)}h`}
              change={8}
              color="purple"
            />
            <StatCard
              icon={Activity}
              title="Recent Enrollments"
              value={analytics.overview.recentEnrollments}
              change={15}
              color="yellow"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daily Learning Progress
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={learningProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {type === 'student' ? 'Learning by Category' : 'Course Categories'}
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <PieChart size={48} className="opacity-50" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      {type === 'student' && analytics.recentProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Learning Activity
          </h3>
          <div className="space-y-4">
            {analytics.recentProgress.slice(0, 5).map((progress, index) => (
              <div
                key={progress._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {progress.course.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {progress.progressPercentage}% complete
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(progress.lastAccessed).toLocaleDateString()}
                  </p>
                  <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${progress.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Course Performance (for instructors) */}
      {type === 'instructor' && analytics.studentProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Student Progress
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2">Student</th>
                  <th className="text-left py-2">Progress</th>
                  <th className="text-left py-2">Time Spent</th>
                  <th className="text-left py-2">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {analytics.studentProgress.slice(0, 10).map((student, index) => (
                  <tr key={student._id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2">
                      <div className="flex items-center space-x-2">
                        <img
                          src={student.user.avatar || '/api/placeholder/32/32'}
                          alt={student.user.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span>{student.user.name}</span>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${student.progressPercentage}%` }}
                          ></div>
                        </div>
                        <span>{student.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-2">{Math.round(student.totalTimeSpent / 60)}h</td>
                    <td className="py-2">
                      {new Date(student.lastAccessed).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
