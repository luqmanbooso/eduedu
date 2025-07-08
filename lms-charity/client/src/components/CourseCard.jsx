import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Users, Clock, BookOpen, Heart, Bookmark, Play, CheckCircle, Award, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CourseCard = ({ course, index = 0, showProgress = false, progressData = null }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is enrolled
  const isEnrolled = user && course.enrolledStudents?.some(e => e.student === user._id);
  const progress = progressData ? progressData.progressPercentage : 0;
  const isCompleted = progress >= 100;

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to like courses');
      return;
    }
    setIsLiked(!isLiked);
    toast.success(isLiked ? 'Removed from likes' : 'Added to likes');
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to bookmark courses');
      return;
    }
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleActionClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (isEnrolled) {
      // Navigate to learning page
      navigate(`/learn/${course._id}`);
    } else {
      // Navigate to course detail for enrollment
      navigate(`/courses/${course._id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <div className="block cursor-pointer">
        <motion.div 
          className="card hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-lg"
          whileHover={{ 
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
          }}
          onClick={() => navigate(`/courses/${course._id}`)}
        >
          {/* Thumbnail with overlay */}
          <div className="relative h-48 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-semibold"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              {course.thumbnail ? (
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <BookOpen className="h-8 w-8" />
                  <span className="text-center">{course.title}</span>
                </div>
              )}
            </motion.div>
            
            {/* Action buttons overlay */}
            <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.button
                onClick={handleLike}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  isLiked 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>
              
              <motion.button
                onClick={handleBookmark}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  isBookmarked 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </motion.button>
            </div>

            {/* Level badge */}
            <div className="absolute top-3 left-3 flex flex-col space-y-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {course.level}
              </span>
              
              {/* Completion badge */}
              {isCompleted && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Completed</span>
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Category */}
            <div className="mb-3">
              <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-3 py-1 rounded-full font-medium">
                {course.category || 'General'}
              </span>
            </div>

            {/* Title */}
            <motion.h3 
              className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              {course.title}
            </motion.h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm leading-relaxed">
              {course.description}
            </p>

            {/* Instructor */}
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                {course.instructor?.name?.charAt(0) || 'A'}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                by {course.instructor?.name || 'Anonymous'}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="flex items-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Users className="h-4 w-4 mr-1" />
                  <span>{course.enrolledStudents || 0}</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{course.lessons?.length || 0} lessons</span>
                </motion.div>
              </div>
              
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                <span className="font-medium">{course.rating?.average || '4.5'}</span>
              </motion.div>
            </div>

            {/* Progress bar for enrolled students */}
            {isEnrolled && showProgress && progressData && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">Progress</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Action button */}
            <motion.button
              onClick={handleActionClick}
              className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-300 transform flex items-center justify-center space-x-2 ${
                isCompleted
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                  : isEnrolled 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isCompleted ? (
                <>
                  <Award className="h-4 w-4" />
                  <span>Review & Certificate</span>
                </>
              ) : isEnrolled ? (
                <>
                  <Play className="h-4 w-4" />
                  <span>Continue Learning</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  <span>View Course</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
