import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  Users, 
  Clock, 
  BookOpen, 
  Heart, 
  Bookmark, 
  Play,
  CheckCircle,
  Award,
  Eye,
  Download,
  MessageSquare,
  Calendar,
  Target,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ModernCourseCard = ({ 
  course, 
  index = 0, 
  variant = 'browse', // 'browse', 'enrolled', 'completed'
  onEnroll,
  onContinue,
  showProgress = false,
  showActions = true 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { user } = useAuth();

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

  const handleEnroll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to enroll');
      return;
    }
    if (onEnroll) {
      onEnroll(course._id);
    } else {
      toast.success('Enrolled successfully!');
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onContinue) {
      onContinue(course._id);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getVariantGradient = () => {
    switch (variant) {
      case 'enrolled':
        return 'from-blue-400 to-purple-600';
      case 'completed':
        return 'from-green-400 to-emerald-600';
      case 'browse':
      default:
        return 'from-indigo-400 to-cyan-600';
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
      className="group relative"
    >
      <Link 
        to={variant === 'enrolled' ? `/courses/${course._id}/learn` : `/courses/${course._id}`} 
        className="block"
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl"
          whileHover={{ 
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
          }}
        >
          {/* Thumbnail Section */}
          <div className="relative h-52 overflow-hidden">
            <motion.div 
              className={`h-full bg-gradient-to-br ${getVariantGradient()} flex items-center justify-center text-white relative`}
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
                <div className="flex flex-col items-center justify-center space-y-3">
                  <BookOpen className="h-12 w-12" />
                  <span className="text-center text-lg font-semibold px-4">
                    {course.title}
                  </span>
                </div>
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>
            
            {/* Floating Action Buttons */}
            {showActions && (
              <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <motion.button
                  onClick={handleLike}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2.5 rounded-full backdrop-blur-md border border-white/20 transition-all ${
                    isLiked 
                      ? 'bg-red-500 text-white shadow-lg' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                </motion.button>
                
                <motion.button
                  onClick={handleBookmark}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2.5 rounded-full backdrop-blur-md border border-white/20 transition-all ${
                    isBookmarked 
                      ? 'bg-amber-500 text-white shadow-lg' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </motion.button>

                {variant === 'enrolled' && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 rounded-full backdrop-blur-md border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    <Eye className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
              
              {course.difficulty && (
                <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                  <div className={`w-2 h-2 rounded-full ${getDifficultyColor(course.difficulty)} mr-1.5`} />
                  {course.difficulty}
                </span>
              )}

              {variant === 'completed' && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Completed
                </span>
              )}

              {course.isFeatured && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured
                </span>
              )}
            </div>

            {/* Progress Indicator for Enrolled Courses */}
            {variant === 'enrolled' && course.progress !== undefined && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-3">
                <div className="flex justify-between items-center text-white text-sm mb-1">
                  <span>Progress</span>
                  <span className="font-semibold">{course.progress}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Category Tag */}
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {course.category || 'General'}
              </span>
            </div>

            {/* Title */}
            <motion.h3 
              className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              {course.title}
            </motion.h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm leading-relaxed">
              {course.shortDescription || course.description}
            </p>

            {/* Instructor Info */}
            <div className="flex items-center mb-4">
              <div className="relative">
                {course.instructor?.avatar ? (
                  <img 
                    src={course.instructor.avatar} 
                    alt={course.instructor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {course.instructor?.name?.charAt(0) || 'A'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {course.instructor?.name || 'Anonymous Instructor'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Instructor
                </p>
              </div>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Users className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {variant === 'browse' ? course.enrolledStudents || 0 : course.totalStudents || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Students</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {course.duration || course.totalLessons || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {course.duration ? 'Hours' : 'Lessons'}
                </p>
              </div>
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < Math.floor(course.rating?.average || 4.5) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`} 
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                  {course.rating?.average || '4.5'}
                </span>
                <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                  ({course.rating?.count || 0})
                </span>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                {variant === 'enrolled' && (
                  <>
                    {course.hasDiscussions && (
                      <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 transition-colors">
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    )}
                    {course.hasAssignments && (
                      <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 transition-colors">
                        <Target className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Pricing for Browse Variant */}
            {variant === 'browse' && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {course.discountPrice ? (
                    <>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${course.discountPrice}
                      </span>
                      <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                        ${course.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </span>
                  )}
                </div>
                {course.discountPrice && (
                  <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs px-2 py-1 rounded-full font-medium">
                    {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
                  </span>
                )}
              </div>
            )}

            {/* Next Lesson for Enrolled Courses */}
            {variant === 'enrolled' && course.nextLesson && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                  Next Lesson:
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {course.nextLesson}
                </p>
              </div>
            )}

            {/* Deadlines for Enrolled Courses */}
            {variant === 'enrolled' && course.upcomingDeadlines && course.upcomingDeadlines.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-300">
                      {course.upcomingDeadlines[0].title}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Due: {course.upcomingDeadlines[0].dueDate}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <motion.button
              onClick={variant === 'browse' ? handleEnroll : handleContinue}
              className={`w-full font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                variant === 'enrolled' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white focus:ring-blue-500' 
                  : variant === 'completed'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white focus:ring-green-500'
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-600 hover:from-indigo-600 hover:to-cyan-700 text-white focus:ring-indigo-500'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center space-x-2">
                {variant === 'enrolled' ? (
                  <>
                    <Play className="h-5 w-5" />
                    <span>Continue Learning</span>
                  </>
                ) : variant === 'completed' ? (
                  <>
                    <Award className="h-5 w-5" />
                    <span>View Certificate</span>
                  </>
                ) : (
                  <>
                    <span>{course.price === 0 ? 'Enroll Free' : 'Enroll Now'}</span>
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </div>
            </motion.button>

            {/* Additional Info for Enrolled Courses */}
            {variant === 'enrolled' && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Last accessed: {course.lastAccessed || 'Never'}</span>
                <span>{course.estimatedTimeLeft || '0h'} remaining</span>
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default ModernCourseCard;
