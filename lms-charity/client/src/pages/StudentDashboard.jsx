import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Clock, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Play, 
  CheckCircle,
  Star,
  Calendar,
  Search,
  Filter,
  Bell,
  Download,
  BarChart3,
  Target,
  Book,
  Video,
  PenTool,
  Brain,
  Trophy,
  Eye,
  ArrowRight,
  BookMarked,
  GraduationCap,
  ChevronRight,
  Heart,
  User,
  Camera,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import NotificationCenter from '../components/NotificationCenter';
import { useStudentDashboard } from '../hooks/useStudentDashboard';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');

  // Use custom hook for dashboard data
  const {
    enrolledCourses,
    loading,
    error,
    continueLearning,
  } = useStudentDashboard();

  // Only two tabs: My Learning and Settings
  const tabContent = {
    courses: <MyCoursesTab courses={enrolledCourses} onContinue={continueLearning} />,
    settings: <SettingsTab user={user} />,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || 'Student'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Continue your learning journey
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'S'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'courses', label: 'My Learning', icon: BookOpen },
              { id: 'settings', label: 'Settings', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
      <FloatingNotificationCenter />
    </>
  );
};

// My Courses Tab Component (no search bar)
const MyCoursesTab = ({ courses, onContinue }) => {
  return (
    <div className="space-y-6">
      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <EnrolledCourseCard key={course._id} course={course} index={index} onContinue={onContinue} />
        ))}
      </div>
      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600">
            Start by enrolling in some courses
          </p>
        </div>
      )}
    </div>
  );
};

// Settings Tab Component with full functionality
const SettingsTab = ({ user }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    location: '',
    phoneNumber: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  React.useEffect(() => {
    fetchProfile();
    fetchAnalytics();
    fetchCertificates();
  }, []);

  React.useEffect(() => {
    if (user && !profileData.name) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: '',
        location: '',
        phoneNumber: ''
      });
    }
  }, [user, profileData.name]);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await api.get('/profile');
      const data = response.data;
      setProfileData({
        name: data.name || user?.name || '',
        email: data.email || user?.email || '',
        bio: data.bio || '',
        location: data.location || '',
        phoneNumber: data.phoneNumber || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Set default data if API fails
      setProfileData({
        name: user?.name || '',
        email: user?.email || '',
        bio: '',
        location: '',
        phoneNumber: ''
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await api.get('/progress/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set default analytics data if API fails
      setAnalytics({
        totalCourses: 0,
        completedCourses: 0,
        totalLearningTime: 0,
        currentStreak: 0,
        averageProgress: 0
      });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchCertificates = async () => {
    setLoadingCertificates(true);
    try {
      const response = await api.get('/certificates/my-certificates');
      setCertificates(response.data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      // Set empty certificates array if API fails
      setCertificates([]);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await api.put('/profile', profileData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadResponse = await api.post('/upload/image', formData);
      const imageUrl = uploadResponse.data.url;
      
      await api.put('/profile/avatar', { avatar: imageUrl });
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadCertificate = async (certificateId) => {
    try {
      const response = await api.get(`/certificates/${certificateId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'certificates', label: 'Certificates', icon: Award }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="md:w-1/4 w-full bg-white border rounded-xl shadow p-6 flex flex-col gap-4">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-semibold transition-colors
              ${activeSection === section.id
                ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700'
                : 'hover:bg-gray-50 text-gray-800'
              }`}
          >
            <section.icon className="h-6 w-6" />
            {section.label}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="md:w-3/4 w-full space-y-8">
        {/* Profile Card */}
        {activeSection === 'profile' && (
          <section className="bg-white border rounded-xl shadow p-8 flex flex-col md:flex-row gap-8 items-center">
            {loadingProfile ? (
              <div className="flex items-center justify-center w-full py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-blue-100 bg-gray-100 flex items-center justify-center text-5xl font-bold text-blue-600">
                    {profileData.name?.charAt(0) || 'S'}
                  </div>
                  <label className="absolute bottom-2 right-2 bg-white border rounded-full p-2 cursor-pointer shadow">
                    <input type="file" accept="image/*" onChange={e => e.target.files[0] && handleAvatarUpload(e.target.files[0])} className="hidden" />
                    <Camera className="h-5 w-5 text-gray-600" />
                  </label>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} disabled={!isEditing} className="input-field text-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} disabled={!isEditing} className="input-field text-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input type="text" value={profileData.location} onChange={e => setProfileData({...profileData, location: e.target.value})} disabled={!isEditing} className="input-field text-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" value={profileData.phoneNumber} onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})} disabled={!isEditing} className="input-field text-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} disabled={!isEditing} rows={3} className="input-field text-lg" />
                  </div>
                  <div className="flex gap-3">
                    {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className="btn-primary text-lg">Edit Profile</button>
                    ) : (
                      <>
                        <button onClick={handleSaveProfile} disabled={loading} className="btn-secondary text-lg">{loading ? 'Saving...' : 'Save Changes'}</button>
                        <button onClick={() => { setIsEditing(false); fetchProfile(); }} className="btn-outline text-lg">Cancel</button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {/* Analytics/Stat Cards */}
        {activeSection === 'analytics' && (
          <section>
            {loadingAnalytics ? (
              <div className="flex items-center justify-center w-full py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard title="Total Courses" value={analytics?.totalCourses || 0} icon={BookOpen} color="blue" />
                  <StatCard title="Completed Courses" value={analytics?.completedCourses || 0} icon={CheckCircle} color="green" />
                  <StatCard title="Learning Time" value={`${analytics?.totalLearningTime || 0}h`} icon={Clock} color="purple" />
                  <StatCard title="Current Streak" value={`${analytics?.currentStreak || 0} days`} icon={TrendingUp} color="yellow" />
                </div>
                <div className="bg-white border rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Average Progress</span>
                      <span className="text-blue-600 font-medium">{analytics?.averageProgress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${analytics?.averageProgress || 0}%` }} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {/* Certificates */}
        {activeSection === 'certificates' && (
          <section>
            {loadingCertificates ? (
              <div className="flex items-center justify-center w-full py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    My Certificates <span className="text-base font-medium text-gray-500">({certificates.length})</span>
                  </h3>
                </div>
                {certificates.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No certificates yet
                    </h3>
                    <p className="text-gray-600">
                      Complete courses to earn certificates and showcase your achievements!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {certificates.map((certificate) => {
                      const certId = certificate.certificateId || certificate._id;
                      const viewUrl = certificate.verificationCode
                        ? `/certificate/${certId}/${certificate.verificationCode}`
                        : null;
                      return (
                        <div
                          key={certId}
                          className="bg-white border border-gray-200 rounded-2xl shadow-lg flex flex-col justify-between h-full p-6 transition hover:shadow-xl"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <Award className="h-8 w-8 text-yellow-500" />
                            <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                              {certificate.grade || 'Completed'}
                            </span>
                          </div>
                          <div className="mb-2">
                            <h3 className="font-bold text-gray-900 text-lg truncate">
                              {certificate.courseName || certificate.course?.title}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              Instructor: {certificate.instructor || certificate.course?.instructor?.name}
                            </p>
                          </div>
                          <div className="mb-4">
                            <p className="text-xs text-gray-500">
                              Completed: {new Date(certificate.completedDate || certificate.issuedAt).toLocaleDateString()}
                            </p>
                            {certificate.score && (
                              <p className="text-xs text-gray-500">Score: {certificate.score}%</p>
                            )}
                          </div>
                          <div className="flex gap-2 mt-auto">
                            <button
                              onClick={() => handleDownloadCertificate(certId)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold flex items-center justify-center transition"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </button>
                            {viewUrl && (
                              <a
                                href={viewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-blue-700 py-2 px-4 rounded-lg font-semibold flex items-center justify-center border border-gray-200 transition"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

// Helper Components
const StatCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-xl shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {value}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {trend}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};

const CourseProgressCard = ({ course }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-50 p-6 rounded-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          {course.title}
        </h3>
        <span className="text-sm text-blue-600 font-medium">
          {course.progress}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${course.progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>{course.completedLessons}/{course.totalLessons} lessons</span>
        <span>{course.estimatedTimeLeft} left</span>
      </div>
      
      <div className="flex space-x-2">
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
          <Play className="h-4 w-4 mr-2" />
          Continue
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
          <Eye className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

const DeadlineCard = ({ deadline }) => {
  const isUrgent = new Date(deadline.dueDate) - new Date() < 3 * 24 * 60 * 60 * 1000; // 3 days

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg ${
      isUrgent ? 'bg-red-50' : 'bg-gray-50'
    }`}>
      <div className={`p-2 rounded-full ${
        deadline.type === 'assignment' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
      }`}>
        {deadline.type === 'assignment' ? <FileText className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">
          {deadline.title}
        </p>
        <p className="text-sm text-gray-600">
          {deadline.courseName} • Due {deadline.dueDate}
        </p>
      </div>
      {isUrgent && (
        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
          Urgent
        </span>
      )}
    </div>
  );
};

const EnrolledCourseCard = ({ course, index, onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
        <BookOpen className="h-12 w-12 text-white" />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
            course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {course.level}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
            {course.category}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {course.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="text-blue-600 font-medium">
              {course.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="flex items-center">
            <Book className="h-4 w-4 mr-1" />
            {course.completedLessons}/{course.totalLessons} lessons
          </span>
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {course.estimatedTimeLeft}
          </span>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {course.hasQuizzes && (
            <button 
              onClick={() => toast.success('Quiz section opened!')}
              className="flex flex-col items-center p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Brain className="h-4 w-4 text-green-600 mb-1" />
              <span className="text-xs text-green-600">Quiz</span>
            </button>
          )}
          {course.hasAssignments && (
            <button 
              onClick={() => toast.success('Assignment section opened!')}
              className="flex flex-col items-center p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText className="h-4 w-4 text-blue-600 mb-1" />
              <span className="text-xs text-blue-600">Tasks</span>
            </button>
          )}
          {course.hasDiscussions && (
            <button 
              onClick={() => toast.success('Discussion forum opened!')}
              className="flex flex-col items-center p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-purple-600 mb-1" />
              <span className="text-xs text-purple-600">Forum</span>
            </button>
          )}
          <button 
            onClick={() => toast.success('Course materials opened!')}
            className="flex flex-col items-center p-2 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Download className="h-4 w-4 text-orange-600 mb-1" />
            <span className="text-xs text-orange-600">Files</span>
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onContinue && onContinue(course._id)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center flex items-center justify-center"
          >
            <Play className="h-4 w-4 mr-2" />
            Continue Learning
          </button>
          
          <Link
            to={`/courses/${course._id}`}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
        
        {course.upcomingDeadlines && course.upcomingDeadlines.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming: {course.upcomingDeadlines[0].title}
            </p>
            <p className="text-xs text-yellow-600">
              Due {course.upcomingDeadlines[0].dueDate}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AvailableCourseCard = ({ course, index, onEnroll }) => {
  const handleEnroll = () => {
    onEnroll(course._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center">
        <BookOpen className="h-12 w-12 text-white" />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
            course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {course.level}
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <span className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
            {course.difficulty}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-3">
          <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
            {course.category}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {course.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
            {course.instructor?.name?.charAt(0) || 'A'}
          </div>
          <span className="text-sm text-gray-500">
            by {course.instructor?.name || 'Anonymous'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {course.enrolledStudents}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {course.duration}h
            </span>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
            <span className="font-medium">{course.rating?.average}</span>
            <span className="ml-1">({course.rating?.count})</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {course.discountPrice ? (
              <>
                <span className="text-lg font-bold text-green-600">
                  ${course.discountPrice}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${course.price}
                </span>
              </>
            ) : course.price === 0 ? (
              <span className="text-lg font-bold text-green-600">
                FREE
              </span>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ${course.price}
              </span>
            )}
          </div>
          {course.discountPrice && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              Save ${course.price - course.discountPrice}
            </span>
          )}
        </div>
        
        {/* Course Features */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            <span>Lifetime Access</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            <span>Mobile & Desktop Access</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            <span>Mobile & Desktop Access</span>
          </div>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <Link
            to={`/courses/${course._id}`}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-center"
          >
            Preview Course
          </Link>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
            <Heart className="h-4 w-4" />
          </button>
        </div>
        
        <button
          onClick={handleEnroll}
          className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-300 ${
            course.price === 0 
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white'
          }`}
        >
          {course.price === 0 ? 'Enroll for Free' : `Enroll Now - $${course.discountPrice || course.price}`}
        </button>
      </div>
    </motion.div>
  );
};

const CourseProgressDetail = ({ course }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">
          {course.title}
        </h3>
        <span className="text-sm font-medium text-blue-600">
          {course.progress}%
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
          style={{ width: `${course.progress}%` }}
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Completed:</span>
          <div className="font-medium text-gray-900">
            {course.completedLessons}/{course.totalLessons} lessons
          </div>
        </div>
        <div>
          <span className="text-gray-600">Next:</span>
          <div className="font-medium text-gray-900">
            {course.nextLesson}
          </div>
        </div>
        <div>
          <span className="text-gray-600">Time Left:</span>
          <div className="font-medium text-gray-900">
            {course.estimatedTimeLeft}
          </div>
        </div>
        <div>
          <span className="text-gray-600">Last Access:</span>
          <div className="font-medium text-gray-900">
            {course.lastAccessed}
          </div>
        </div>
      </div>
    </div>
  );
};



export default StudentDashboard;

// Add floating NotificationCenter for students
import NotificationCenter from '../components/NotificationCenter';

function FloatingNotificationCenter() {
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 1000 }}>
      <NotificationCenter />
    </div>
  );
}
