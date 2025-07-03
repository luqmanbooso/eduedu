import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Users, 
  Clock, 
  Star, 
  BookOpen, 
  Award, 
  CheckCircle, 
  Lock,
  ArrowRight,
  Calendar,
  User,
  TrendingUp,
  Download
} from 'lucide-react';
import { enrollmentAPI, certificateAPI, notificationHelpers } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EnhancedCourseCard = ({ course, showEnrollmentStatus = true, compact = false }) => {
  const { user } = useAuth();
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showEnrollmentStatus && user && course._id) {
      fetchEnrollmentStatus();
    }
  }, [course._id, user, showEnrollmentStatus]);

  const fetchEnrollmentStatus = async () => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getEnrollmentStatus(course._id);
      setEnrollmentStatus(response.data);
    } catch (error) {
      console.error('Error fetching enrollment status:', error);
      setEnrollmentStatus({ isEnrolled: false, canEnroll: true });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      setIsEnrolling(true);
      const response = await enrollmentAPI.enrollInCourse(course._id);
      
      if (response.success) {
        notificationHelpers.showEnrollmentSuccess(course.title);
        await fetchEnrollmentStatus(); // Refresh status
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to enroll in course';
      if (window.showNotification) {
        window.showNotification({
          type: 'error',
          title: 'Enrollment Failed',
          message: errorMessage
        });
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleContinue = () => {
    window.location.href = `/courses/${course._id}/learn`;
  };

  const handleViewCertificate = () => {
    if (enrollmentStatus?.certificate?.certificateId) {
      window.location.href = `/certificates/${enrollmentStatus.certificate.certificateId}`;
    }
  };

  const handleDownloadCertificate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await certificateAPI.downloadCertificate(enrollmentStatus.certificate.certificateId);
      notificationHelpers.showCertificateDownload(enrollmentStatus.certificate.certificateId);
    } catch (error) {
      console.error('Download error:', error);
      if (window.showNotification) {
        window.showNotification({
          type: 'error',
          title: 'Download Failed',
          message: 'Failed to download certificate'
        });
      }
    }
  };

  const getEnrollmentButton = () => {
    if (loading) {
      return (
        <button disabled className="w-full bg-gray-200 text-gray-500 py-3 px-4 font-serif font-semibold transition-all cursor-not-allowed">
          Loading...
        </button>
      );
    }

    if (!user) {
      return (
        <button 
          onClick={() => window.location.href = '/login'}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 font-serif font-semibold transition-all hover:shadow-lg transform hover:-translate-y-0.5"    
        >
          Login to Enroll
        </button>
      );
    }

    if (!enrollmentStatus) {
      return (
        <button 
          onClick={handleEnroll}
          disabled={isEnrolling}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-4 font-serif font-semibold transition-all hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
        </button>
      );
    }

    if (!enrollmentStatus.isEnrolled) {
      if (enrollmentStatus.canEnroll) {
        return (
          <button 
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-4 font-serif font-semibold transition-all hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
          </button>
        );
      } else {
        return (
          <button disabled className="w-full bg-gray-300 text-gray-500 py-3 px-4 font-serif font-semibold cursor-not-allowed">
            <Lock className="w-4 h-4 inline mr-2" />
            Not Available
          </button>
        );
      }
    }

    if (enrollmentStatus.progress.isCompleted) {
      return (
        <div className="space-y-2">
          <button 
            onClick={handleViewCertificate}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 font-serif font-semibold transition-all hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center"
          >
            <Award className="w-4 h-4 mr-2" />
            View Certificate
          </button>
          {enrollmentStatus.certificate && (
            <button 
              onClick={handleDownloadCertificate}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 text-sm font-serif font-semibold transition-all flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          )}
        </div>
      );
    }

    return (
      <button 
        onClick={handleContinue}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 font-serif font-semibold transition-all hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center"
      >
        <Play className="w-4 h-4 mr-2" />
        Continue Learning
      </button>
    );
  };

  const getProgressBar = () => {
    if (!enrollmentStatus?.isEnrolled) return null;

    const progress = enrollmentStatus.progress.percentage;
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-serif font-semibold text-gray-700">Progress</span>
          <span className="text-sm font-serif font-bold text-purple-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 h-2">
          <motion.div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 transition-all duration-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <div className="flex items-center justify-between mt-1 text-xs text-gray-500 font-serif">
          <span>{enrollmentStatus.progress.completedLessons} of {enrollmentStatus.progress.totalLessons} lessons</span>
          {enrollmentStatus.progress.isCompleted && (
            <span className="text-green-600 font-semibold flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </span>
          )}
        </div>
      </div>
    );
  };

  const getBadges = () => {
    const badges = [];

    if (enrollmentStatus?.isEnrolled) {
      if (enrollmentStatus.progress.isCompleted) {
        badges.push(
          <span key="completed" className="inline-flex items-center px-2 py-1 text-xs font-serif font-semibold bg-green-100 text-green-800 rounded-full">
            <Award className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      } else {
        badges.push(
          <span key="enrolled" className="inline-flex items-center px-2 py-1 text-xs font-serif font-semibold bg-blue-100 text-blue-800 rounded-full">
            <BookOpen className="w-3 h-3 mr-1" />
            Enrolled
          </span>
        );
      }
    }

    if (course.featured) {
      badges.push(
        <span key="featured" className="inline-flex items-center px-2 py-1 text-xs font-serif font-semibold bg-amber-100 text-amber-800 rounded-full">
          <Star className="w-3 h-3 mr-1" />
          Featured
        </span>
      );
    }

    if (course.level) {
      badges.push(
        <span key="level" className="inline-flex items-center px-2 py-1 text-xs font-serif font-semibold bg-gray-100 text-gray-700 rounded-full">
          {course.level}
        </span>
      );
    }

    return badges;
  };

  if (compact) {
    return (
      <motion.div 
        className="bg-white border shadow-sm hover:shadow-md transition-all duration-200 p-4"
        whileHover={{ y: -2 }}
      >
        <div className="flex space-x-4">
          <div className="w-20 h-16 bg-gray-200 flex-shrink-0 flex items-center justify-center">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-serif font-bold text-gray-900 text-sm line-clamp-2 mb-1">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-600 font-serif mb-2">
                  by {course.instructor?.name || 'Unknown'}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 font-serif">
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {course.studentCount || 0}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {course.estimatedDuration || 0}h
                  </span>
                  {course.rating && (
                    <span className="flex items-center">
                      <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                      {course.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {getProgressBar()}
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {getBadges()}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border"
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Course Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
            <BookOpen className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {getBadges()}
        </div>
        
        {/* Duration overlay */}
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 text-xs font-serif font-semibold flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {course.estimatedDuration || 0}h
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        {/* Course Title */}
        <h3 className="font-serif font-bold text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center mb-3">
          <User className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600 font-serif">
            by {course.instructor?.name || 'Unknown'}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 font-serif">
          {course.description}
        </p>

        {/* Progress Bar (if enrolled) */}
        {getProgressBar()}

        {/* Course Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500 font-serif">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {course.studentCount || 0} students
            </span>
            {course.rating && (
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                {course.rating.toFixed(1)} ({course.reviewCount || 0})
              </span>
            )}
          </div>
          
          {course.category && (
            <span className="text-purple-600 font-semibold">
              {course.category}
            </span>
          )}
        </div>

        {/* Enrollment Actions */}
        {showEnrollmentStatus && (
          <div className="pt-4 border-t border-gray-100">
            {getEnrollmentButton()}
          </div>
        )}

        {/* Additional Info for enrolled students */}
        {enrollmentStatus?.isEnrolled && !enrollmentStatus.progress.isCompleted && (
          <div className="mt-3 text-xs text-gray-500 font-serif text-center">
            Last accessed: {enrollmentStatus.lastAccessed ? 
              new Date(enrollmentStatus.lastAccessed).toLocaleDateString() : 'Never'}
          </div>
        )}

        {/* Certificate info for completed courses */}
        {enrollmentStatus?.certificate && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-serif font-semibold text-green-800">
                Certificate Earned
              </span>
            </div>
            <div className="text-xs text-green-700 font-serif">
              Grade: <span className="font-bold">{enrollmentStatus.certificate.grade}</span>
              {enrollmentStatus.certificate.score && (
                <span> • Score: {enrollmentStatus.certificate.score}%</span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedCourseCard;
